//modificacion del modo processing para adaptarlo a processing.

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function(CodeMirror) {
    "use strict";

    CodeMirror.defineMode("processing", function(config, parserConfig) {
        var indentUnit = config.indentUnit,
            statementIndentUnit = parserConfig.statementIndentUnit || indentUnit,
            dontAlignCalls = parserConfig.dontAlignCalls,
            keywords = parserConfig.keywords || {},
            builtin = parserConfig.builtin || {},
            blockKeywords = parserConfig.blockKeywords || {},
            outerBlockKeywords = parserConfig.outerBlockKeywords || {},
            constantKeywords = parserConfig.constantKeywords || {},
            atoms = parserConfig.atoms || {},
            hooks = parserConfig.hooks || {},
            multiLineStrings = parserConfig.multiLineStrings;
        var isOperatorChar = /[+\-*&%=<>!?|\/]/;

        var curPunc;

        /*
         Levanta los tokens y los parsea.
         */
        function tokenBase(stream, state) {
            var ch = stream.next();
            if (hooks[ch]) {
                var result = hooks[ch](stream, state);
                if (result !== false) return result;
            }
            if (ch == '"' || ch == "'") {
                state.tokenize = tokenString(ch);
                return state.tokenize(stream, state);
            }
            if (/[\[\]{}\(\),;\:\.]/.test(ch)) {
                curPunc = ch;
                return null;
            }
            // Asigna la clase de los números
            if (/\d/.test(ch)) {
                stream.eatWhile(/[\w\.]/);
                return "number";
            }
            if (ch == "/") {
                if (stream.eat("*")) {
                    state.tokenize = tokenComment;
                    return tokenComment(stream, state);
                }
                if (stream.eat("/")) {
                    stream.skipToEnd();
                    return "comment";
                }
            }
            if (isOperatorChar.test(ch)) {
                stream.eatWhile(isOperatorChar);
                return "operator";
            }
            stream.eatWhile(/[\w\$_]/);
            var cur = stream.current();

            // Esto esta agregado por mi para diferenciar de clase los keywords de bloque
            // porque antes no los diferenciaba

            if (blockKeywords.propertyIsEnumerable(cur)) {
                return "blockKeyword";
            };


            if (constantKeywords.propertyIsEnumerable(cur)) {
                return "constantKeyword";
            }


            if (outerBlockKeywords.propertyIsEnumerable(cur)) {
                return "outerBlockKeyword";
            };

            if (keywords.propertyIsEnumerable(cur)) {
                if (blockKeywords.propertyIsEnumerable(cur)) curPunc = "newstatement";
                // Esta la clase que asigna
                return "keyword";
            }
            if (builtin.propertyIsEnumerable(cur)) {
                if (blockKeywords.propertyIsEnumerable(cur)) curPunc = "newstatement";
                return "builtin";
            }
            if (atoms.propertyIsEnumerable(cur)) {
                return "atom";
            }



            // Si no es nada de todo lo anterior devuelve "variable"
            // lo cual me parece que esta como el culo pero por ahora sirve
            //return "variable";
        }

        function tokenString(quote) {
            return function(stream, state) {
                var escaped = false,
                    next, end = false;
                while ((next = stream.next()) != null) {
                    if (next == quote && !escaped) {
                        end = true;
                        break;
                    }
                    escaped = !escaped && next == "\\";
                }
                if (end || !(escaped || multiLineStrings))
                    state.tokenize = null;
                return "string";
            };
        }

        function tokenComment(stream, state) {
            var maybeEnd = false,
                ch;
            while (ch = stream.next()) {
                if (ch == "/" && maybeEnd) {
                    state.tokenize = null;
                    break;
                }
                maybeEnd = (ch == "*");
            }
            return "comment";
        }

        function Context(indented, column, type, align, prev) {
            this.indented = indented;
            this.column = column;
            this.type = type;
            this.align = align;
            this.prev = prev;
        }

        function pushContext(state, col, type) {
            var indent = state.indented;
            if (state.context && state.context.type == "statement")
                indent = state.context.indented;
            return state.context = new Context(indent, col, type, null, state.context);
        }

        function popContext(state) {
            var t = state.context.type;
            if (t == ")" || t == "]" || t == "}")
                state.indented = state.context.indented;
            return state.context = state.context.prev;
        }

        // Interface

        return {
            startState: function(basecolumn) {
                return {
                    tokenize: null,
                    context: new Context((basecolumn || 0) - indentUnit, 0, "top", false),
                    indented: 0,
                    startOfLine: true
                };
            },

            token: function(stream, state) {
                var ctx = state.context;
                if (stream.sol()) {
                    if (ctx.align == null) ctx.align = false;
                    state.indented = stream.indentation();
                    state.startOfLine = true;
                }
                if (stream.eatSpace()) return null;
                curPunc = null;
                var style = (state.tokenize || tokenBase)(stream, state);
                if (style == "comment" || style == "meta") return style;
                if (ctx.align == null) ctx.align = true;

                if ((curPunc == ";" || curPunc == ":" || curPunc == ",") && ctx.type == "statement") popContext(state);
                else if (curPunc == "{") pushContext(state, stream.column(), "}");
                else if (curPunc == "[") pushContext(state, stream.column(), "]");
                else if (curPunc == "(") pushContext(state, stream.column(), ")");
                else if (curPunc == "}") {
                    while (ctx.type == "statement") ctx = popContext(state);
                    if (ctx.type == "}") ctx = popContext(state);
                    while (ctx.type == "statement") ctx = popContext(state);
                } else if (curPunc == ctx.type) popContext(state);
                else if (((ctx.type == "}" || ctx.type == "top") && curPunc != ';') || (ctx.type == "statement" && curPunc == "newstatement"))
                    pushContext(state, stream.column(), "statement");
                state.startOfLine = false;
                return style;
            },

            indent: function(state, textAfter) {
                if (state.tokenize != tokenBase && state.tokenize != null) return CodeMirror.Pass;
                var ctx = state.context,
                    firstChar = textAfter && textAfter.charAt(0);
                if (ctx.type == "statement" && firstChar == "}") ctx = ctx.prev;
                var closing = firstChar == ctx.type;
                if (ctx.type == "statement") return ctx.indented + (firstChar == "{" ? 0 : statementIndentUnit);
                else if (ctx.align && (!dontAlignCalls || ctx.type != ")")) return ctx.column + (closing ? 0 : 1);
                else if (ctx.type == ")" && !closing) return ctx.indented + statementIndentUnit;
                else return ctx.indented + (closing ? 0 : indentUnit);
            },

            electricChars: "{}",
            blockCommentStart: "/*",
            blockCommentEnd: "*/",
            lineComment: "//",
            fold: "brace"
        };
    });

    function words(str) {
        var obj = {},
            words = str.split(" ");
        for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
        return obj;
    }
    var cKeywords = "auto if break int case long char register continue return default short do sizeof " +
        "double static else struct entry switch extern typedef float union for unsigned " +
        "goto while enum void const signed volatile";





    // C#-style strings where "" escapes a quote.
    function tokenAtString(stream, state) {
        var next;
        while ((next = stream.next()) != null) {
            if (next == '"' && !stream.eat('"')) {
                state.tokenize = null;
                break;
            }
        }
        return "string";
    }

    // C++11 raw string literal is <prefix>"<delim>( anything )<delim>", where
    // <delim> can be a string up to 16 characters long.
    function tokenRawString(stream, state) {
        // Escape characters that have special regex meanings.
        var delim = state.cpp11RawStringDelim.replace(/[^\w\s]/g, '\\$&');
        var match = stream.match(new RegExp(".*?\\)" + delim + '"'));
        if (match)
            state.tokenize = null;
        else
            stream.skipToEnd();
        return "string";
    }

    function def(mimes, mode) {
        if (typeof mimes == "string") mimes = [mimes];
        var words = [];

        function add(obj) {
            if (obj)
                for (var prop in obj)
                    if (obj.hasOwnProperty(prop))
                        words.push(prop);
        }
        add(mode.keywords);
        add(mode.builtin);
        add(mode.atoms);
        if (words.length) {
            mode.helperType = mimes[0];
            CodeMirror.registerHelper("hintWords", mimes[0], words);
        }

        for (var i = 0; i < mimes.length; ++i)
            CodeMirror.defineMIME(mimes[i], mode);
    }

    def("processing", {
        name: "processing",
        keywords: words("abstract assert boolean break byte case catch char class color const continue default " +
            "do double else enum extends final finally float for goto if implements import " +
            "instanceof int interface long native new package private protected public " +
            "return short static strictfp super switch synchronized this throw throws transient " +
            "try volatile while " +
            //Composite
            "Array ArrayList FloatDict FloatList HashMap IntDict IntList JSONArray JSONObject Object String StringDict StringList Table TableRow XML " +
            //Object processing
            "PVector PFont PGraphics PShape BufferedReader PImage PShader  " +

            ""
        ),
        blockKeywords: words("catch do else finally for if switch try while"),
        outerBlockKeywords: words("void class"),
        atoms: words("true false null"),
        constantKeywords: words("HALF_PI PI QUARTER_PI TAU TWO_PI width height frameCount"),
        builtin: words(
            //Structure 
            "draw exit loop noLoop popStyle pushStyle redraw setup " +
            //Environment 
            "cursor displayHeight displayWidth focused noCursor size frameRate " +
            //Conversion
            "binary boolean byte char float hex int str unbinary unhex " +
            //String Functions
            "join match matchAll nf nfc nfp nfs split splitTokens trim " +
            //Array Functions
            "append arrayCopy concat expand reverse shorten sort splice subset " +
            //Shape 
            "createShape loadShape " +
            //2D Primitives 
            "arc ellipse line point quad rect triangle " +
            //Curves
            "bezier bezierDetail bezierPoint bezierTangent curve curveDetail curvePoint curveTangent curveTightness " +
            //3D Primitives
            "box sphere sphereDetail " +
            //Attributes
            "ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight " +
            //Vertex
            "beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex " +
            //Loading & Displaying
            "shape shapeMode " +
            //Input Mouse
            "mouseButton mouseClicked mouseDragged mouseMoved mousePressed mousePressed mouseReleased mouseWheel mouseX mouseY pmouseX pmouseY " +
            //Keyboard
            "key keyCode keyPressed keyPressed keyReleased keyTyped " +
            //Files
            "createInput createReader loadBytes loadJSONArray loadJSONObject loadStrings loadTable loadXML open parseXML selectFolder selectInput " +
            //Time & Date
            "day hour millis minute month second year " +
            //Output Text Area
            "print printArray println " +
            //Image
            "save saveFrame " +
            //Files
            "beginRaw beginRecord createOutput createWriter endRaw endRecord PrintWriter saveBytes saveJSONArray saveJSONObject saveStream saveStrings saveTable saveXML selectOutput " +
            //Transform 
            "applyMatrix popMatrix printMatrix pushMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate " +
            //Lights, Camera Lights
            "ambientLight directionalLight lightFalloff lights lightSpecular noLights normal pointLight spotLight " +
            //Camera
            "beginCamera camera endCamera frustum ortho perspective printCamera printProjection " +
            //Coordinates
            "modelX modelY modelZ screenX screenY screenZ " +
            //Material Properties
            "ambient emissive shininess specular " +
            //ColorSetting
            "background clear colorMode fill noFill noStroke stroke " +
            //Creating & Reading
            "alpha blue brightness color green hue lerpColor red saturation " +
            //Image 
            "createImage " +
            //Loading & Displaying
            "image imageMode loadImage noTint requestImage tint " +
            //Textures
            "texture textureMode textureWrap " +
            //Pixels
            "blend copy filter get loadPixels pixels set updatePixels " +
            //Rendering 
            "blendMode createGraphics " +
            //Shader
            "loadShader resetShader shader " +
            //Typography 
            "createFont loadFont text textFont textAlign textLeading textMode textSize textWidth " +
            //Metrics
            "textAscent textDescent " +
            //Calculation
            "abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt " +
            //Trigonometry
            "acos asin atan atan2 cos degrees radians sin tan " +
            //Random
            "noise noiseDetail noiseSeed random randomGaussian randomSeed " +
            ""
        ),
        hooks: {
            "@": function(stream) {
                stream.eatWhile(/[\w\$_]/);
                return "meta";
            }
        },
        modeProps: {
            fold: ["brace", "import"]
        }
    });
});