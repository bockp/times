/*
 *  TIMES: Tiny Image ECMAScript Application
 *  Copyright (C) 2017  Jean-Christophe Taveau.
 *
 *  This file is part of TIMES
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,Image
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with TIMES.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 * Authors:
 * Jean-Christophe Taveau
 */

const SOBEL_H = [-1, 0, 1,-2,0, 2,-1, 0, 1];
const SOBEL_V = [1, 2, 1,0,0, 0,-1, -2, -1];

/**
 * <Description>
 *
 * @param {type} <name> - <Description>
 * @return {type} - <Description>
 *
 * @author
 */
 
 
const my_function = function (img,copy=true) {
  let ouput =  TImage.from(img,copy);
  // TODO
  return output;
}

//TODO function initiating a gaussian kernel 3x3 or 5x5 with sigma (stdev) as parameter

const padding = function (data, W, H, dim, pad, copy=true) {
	
	//const pW=W+(pad*2);
	let pad_img = Array((W+(pad*2))*(H+(pad*2))).fill(0);
	for (let i=0; i<W*H; i++)
	{
		pad_img[(Math.floor(i/W)+1)*(W+(pad*2))+((i%W)+1)]=data[Math.floor(i/W)*W+(i%W)]
	} //try with reduce
	console.log(pad_img);
		
	return pad_img;
}

const convolve = function (img, kernel, copy=true) {
	const dim = Math.sqrt(kernel.length); //kernel dimension
	const pad = Math.floor(dim/2); //padding
	
	if (dim % 2 !== 1) 
	{
        console.log("error in kernel dimensions");
    }
    const W=img.width;
    const H=img.height;
    const data=img.data;
	
	console.log("padding");
	let pad_img = padding(img.pixelData, img.width, img.height, Math.sqrt(kernel.length), Math.floor(dim/2), copy=true);
	
	console.log("convolving");
	let conv_img = Array(W*H).fill(0);
	
	let row_idx, col_idx, ker_i, img_i, ker_row_idx, ker_col_idx;
	for (col_idx = pad; col_idx <= W; col_idx++)
	{
		//console.log(col_idx); OK
		for (row_idx = pad; row_idx <= H; row_idx++)
		{
			//console.log(row_idx); OK
			let val=0;
			for (ker_col_idx = -pad; ker_col_idx <= pad; ker_col_idx++)
			{
				for (ker_row_idx= -pad; ker_row_idx <= pad; ker_row_idx ++)
				{
					ker_i = (ker_col_idx+pad)*dim + (ker_row_idx+pad); //kernel index to iterate through kernel line by line
					//console.log(ker_i); OK
					img_i = ((col_idx+ker_col_idx)*(H+(pad*2)) + (row_idx + ker_row_idx)); // image index to iterate through portion of image (with pading) under kernel line by line , only get index of R value each time
					//console.log(img_i); OK
					//console.log(pad_img[img_i]*kernel[ker_i]); OK
					val += pad_img[img_i]*kernel[ker_i]; 
					
				}
			}
			
		let i = ((col_idx - pad)*H + (row_idx - pad)); // pixel index in the output image (no padding)
		if (val < 0)
		{
			val=0;
		}
		else if (val > 255)
		{
			val=255;
		}
		conv_img[i]=val;
		

		}

	}
	
	console.log(conv_img);
	return conv_img;
}

//next functions are for Canny algorithm, please de not modify 
	
const nonmax = function(data, W, H, grad, theta) 
{
	
	let newGrad=grad.slice(); //new grad values

	let i;
	for (i=0; i <= data.length; i++)
	{					
			if ( (i%W == (0 || W-1)) || (Math.floor(i/W) == (0 || H-1)) )
			{
				newGrad[i]=0; //suppress pixels at the edge of the input image
			}
			
			if ( (theta[i] == 0) && ( (grad[i] <= grad[i-1]) || (grad[i] <= grad[i+1]) ) ) //horizontal direction : compare with previous and next pixel
			{
				newGrad[i]=0;
			}
			
			if ( (theta[i] == 45) && ( (grad[i] <= grad[i%W-1+W*Math.floor(i/W)+1]) || (grad[i] <= grad[i%W+1+W*Math.floor(i/W)-1]) ) ) //NE-SO direction : compare with previous and next pixel
			{
				newGrad[i]=0;
			}
			
			if ( (theta[i] == 90) && ( (grad[i] <= grad[i%W-1+W*Math.floor(i/W)]) || (grad[i] <= grad[i%W+1+W*Math.floor(i/W)]) ) ) //vertical direction : compare with previous and next pixel
			{
				newGrad[i]=0;
			}
			
			if ( (theta[i] == 135) && ( (grad[i] <= grad[i%W-1+W*Math.floor(i/W)-1]) || (grad[i] <= grad[i%W+1+W*Math.floor(i/W)+1]) ) ) //NW-SE direction : compare with previous and next pixel
			{
				newGrad[i]=0;
			}		

	}

    return newGrad;

}

const hysteresis = function(data, W, H, strong_edges, thresholded_edges) 
{
	
	let edges=strong_edges.slice(); //final edge pixels
	let pixels=[];

	let i;
	for (i=1; i <= data.length-1; i++)
	{					
		if ( (thresholded_edges[i] === 1) && ( (thresholded_edges[i%W-1+W*Math.floor(i/W)-1] === 2) || (thresholded_edges[i%W+W*Math.floor(i/W)-1] === 2) || (thresholded_edges[i%W+1+W*Math.floor(i/W)-1] === 2) || (thresholded_edges[i%W-1+W*Math.floor(i/W)] === 2) || (thresholded_edges[i%W+1+W*Math.floor(i/W)] === 2)  || (thresholded_edges[i%W-1+W*Math.floor(i/W)+1] === 2) || (thresholded_edges[i%W+W*Math.floor(i/W)+1] === 2) || (thresholded_edges[i%W+1+W*Math.floor(i/W)+1] === 2) ) ) //weak edge is next to a strong edge (8-connectivity)
		{
			pixels.push(i); //we keep the pixel
			edges[i]=255;
		}	
	}
	
	//extend

    return edges;

}

const canny = function(img, low_thr, high_thr, copy=true)
{
	const W = img.width;
	const H = img.height;
	let data = img.pixelData;
	
	//TODO convert rgb to greyscale
	//TODO gaussian filtering (init + convolve)
	
	console.log("horizontal sobel");
    Gx = convolve(data, W, H, SOBEL_H);
	console.log("vertical sobel");
    Gy = convolve(data, W, H, SOBEL_V);
	console.log("gadient magnitude");
    const G = Gx.map((x,i) => Math.sqrt(Math.pow(Gx[i],2.0)+Math.pow(Gy[i],2.0)));
    console.log(G);
    console.log("intensity gradient orientation");
    const theta = Gx.map((x,i) => Math.atan2(Gy[i],Gx[i])*(180/Math.PI)); //get angle in rad and convert to degrees
    console.log(theta);
    //non-maximum suppression
    console.log("non-maximum suppression");
    let newGrad = nonmax(data, W, H, G, theta);
    console.log(newGrad);
    console.log("double threshold");
    const strong_edges = newGrad.map(x => x>high_thr ? x=255 : x=0);
    console.log(strong_edges); //ok
    const thresholded_edges = newGrad.map(function (x) 
    {
    	if (x > high_thr)
    	{
    		x=2; //strong edge
    	}
    	else if (x > low_thr)
    	{
    		x=1; //weak edge
    	}
    	else
    	{
    		x=0;
    	}
    	return x;
    }); 
    console.log(thresholded_edges); 
    
    //edge tracing with hysteresis : weak pixels near strong pixels
    console.log("hysteresis"); 
    let edges = hysteresis(data, W, H, strong_edges, thresholded_edges);
    console.log(edges);
    
    return edges;
}














