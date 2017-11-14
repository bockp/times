let img = new TImage('uint8',20,20);
img.setPixels(test_px);
console.log(img.pixelData);
newImg=canny(img,2.5,7.5);
console.log("end");
console.log(newImg);

let array="";
for (x of newImg)
{
	array+=x+"\t";
}
console.log(array);


//TODO copy paste the values then feed it to a function that formats it for imageJ, test with the result of sobel convolution
