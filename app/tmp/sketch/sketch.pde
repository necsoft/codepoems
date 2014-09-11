//Soy un archivito de prueba!

void setup(){
size(800,600);
colorMode(HSB);

}


void draw(){
background(noise(frameCount*0.05)*255,255,255);

}