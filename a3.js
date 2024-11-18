import { Framebuffer } from './framebuffer.js';
import { Rasterizer } from './rasterizer.js';
// DO NOT CHANGE ANYTHING ABOVE HERE

// take two vertices defining line and rasterize to framebuffer
Rasterizer.prototype.drawLine = function(v1, v2) {
  let [x1, y1, c1] = v1;
  let [x2, y2, c2] = v2;

  
  const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  // if the line is vertical
  if (x1 === x2) {
    if (y1 > y2) {
      [x1, x2] = [x2, x1];
      [y1, y2] = [y2, y1];
      [c1, c2] = [c2, c1];
    }
    
    let y = y1;
    
    while (y <= y2) {
      let t = Math.sqrt((x1 - x1) ** 2 + (y - y1) ** 2) / lineLength; 
      let color = interpolateLineColor(t, c1, c2);
      console.log(color);
      this.setPixel(x1, y, color);
      y++;
    }
  }

  // if the line is horizontal
  else if (y1 === y2) {
    if (x1 > x2) {
      [x1, x2] = [x2, x1];
      [y1, y2] = [y2, y1];
      [c1, c2] = [c2, c1];
    }

    let x = x1;
    while (x <= x2) {
      let t = Math.sqrt((x - x1) ** 2 + (y1 - y1) ** 2) / lineLength;
      let color = interpolateLineColor(t, c1, c2);
      this.setPixel(x, y1, color);
      x++;
    }
  }

  
  else {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let m = dy / dx;
    
    
    // if the slope is less than 1
    if (Math.abs(m) <= 1) {
      if (x1 > x2) {
        [x1, x2] = [x2, x1];
        [y1, y2] = [y2, y1];
        [c1, c2] = [c2, c1];
      }

      let y = y1;
      for (let x = x1; x <= x2; x++) {
        let t = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2) / lineLength;
        let color = interpolateLineColor(t, c1, c2);
        this.setPixel(x, Math.round(y), color);
        y += m;
      }

    }
    // if the slope is greater than 1
    else {
      if (y1 > y2) {
        [x1, x2] = [x2, x1];
        [y1, y2] = [y2, y1];
        [c1, c2] = [c2, c1];
      }
      let x = x1;
      for (let y = y1; y <= y2; y++) {
        let t = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2) / lineLength;
        let color = interpolateLineColor(t, c1, c2);
        this.setPixel(Math.round(x), y, color);
        x += 1 / m;
      }

    }

  }
}

//helper function for color interpolation
function interpolateLineColor(t, c1, c2) {
  const r = (1 - t) * c1[0] + t * c2[0];
  const g = (1 - t) * c1[1] + t * c2[1];
  const b = (1 - t) * c1[2] + t * c2[2];
  return [r, g, b];
}

// take 3 vertices defining a solid triangle and rasterize to framebuffer
Rasterizer.prototype.drawTriangle = function(v1, v2, v3) {
  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;
  const [x3, y3, [r3, g3, b3]] = v3;
  const xMin = Math.ceil(Math.min(x1, x2, x3));
  const xMax = Math.ceil(Math.max(x1, x2, x3));
  const yMin = Math.ceil(Math.min(y1, y2, y3));
  const yMax = Math.ceil(Math.max(y1, y2, y3));
  for (let x = xMin; x <= xMax; x++) {
    for (let y = yMin; y <= yMax; y++) {
      if (pointIsInsideTriangle(v1, v2, v3, [x, y])) {
        let color = barycentricCoordinates(v1, v2, v3, [x, y]);
        
        this.setPixel(x, y, color);
      }
    }
  }
  
}

function barycentricCoordinates(v1, v2, v3, p) {
  const [x1, y1, color1] = v1;
  const [x2, y2, color2] = v2;
  const [x3, y3, color3] = v3;
  const [x, y] = p;
  // p v2 v3
  const a1 = 1/2 * Math.abs((x2 - x)*(y3 - y) - (y2 - y)*(x3 - x));

  // p v1 v3
  const a2 = 1/2 * Math.abs((x1 - x)*(y3 - y) - (y1 - y)*(x3 - x));

  // p v1 v2
  const a3 = 1/2 * Math.abs((x1 - x)*(y2 - y) - (y1 - y)*(x2 - x));

  const a = a1 + a2 + a3;
  const u = a1 / a;
  const v = a2 / a;
  const w = a3 / a;

  let r = u * color1[0] + v * color2[0] + w * color3[0];
  let g = u * color1[1] + v * color2[1] + w * color3[1];
  let b = u * color1[2] + v * color2[2] + w * color3[2];
  console.log(r, g, b);

  return [r, g, b];

}

function pointIsInsideTriangle(v1, v2, v3, p) {
  const [x1, y1] = v1;
  const [x2, y2] = v2;
  const [x3, y3] = v3;
  const [x, y] = p;

  // first line: v1(start) to v2(end)
  let a = y2 - y1;
  let b = x1 - x2;
  let c = x2 * y1 - x1 * y2;

  let f = a * x + b * y + c;
  if (f < 0) return false;

  if (f === 0) {
    // check if not top edge and not left edge
    if (!((y1 === y2 && y3 > y1) || y2 > y1)) {
      return false;
    }
  
  }

  // second line: v2(start) to v3(end)
  a = y3 - y2;
  b = x2 - x3;
  c = x3 * y2 - x2 * y3;

  f = a * x + b * y + c;
  if (f < 0) return false;

  if (f === 0) {
    // check if not top edge and not left edge
    if (!((y2 === y3 && y1 > y2) || y3 > y2)) {
      return false;
    }
  }

  // third line: v3(start) to v1(end)
  a = y1 - y3;
  b = x3 - x1;
  c = x1 * y3 - x3 * y1;

  f = a * x + b * y + c;
  if (f < 0) return false;

  if (f === 0) {
    // check if not top edge and not left edge
    if (!((y3 === y1 && y2 > y3) || y1 > y3)) {
      return false;
    }
  }

  return true;

  
}


////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change DEF_INPUT to create something interesting!
////////////////////////////////////////////////////////////////////////////////
const DEF_INPUT = [
  "v,10,10,1.0,0.0,0.0;",
  "v,52,52,0.0,1.0,0.0;",
  "v,52,10,0.0,0.0,1.0;",
  "v,10,52,1.0,1.0,1.0;",
  "t,0,1,2;",
  "t,0,3,1;",
  "v,10,10,1.0,1.0,1.0;",
  "v,10,52,0.0,0.0,0.0;",
  "v,52,52,1.0,1.0,1.0;",
  "v,52,10,0.0,0.0,0.0;",
  "l,4,5;",
  "l,5,6;",
  "l,6,7;",
  "l,7,4;",

  // v8 - v15
  "v,28,25,0.2,0.2,0.2;",
  "v,23,30,0.0,0.0,0.0;",
  "v,23,35,0.0,0.0,0.0;",
  "v,28,40,0.0,0.0,0.0;",
  "v,34,40,0.0,0.0,0.0;",
  "v,39,35,0.2,0.2,0.2;",
  "v,39,30,0.4,0.4,0.4;",
  "v,34,25,0.4,0.4,0.4;",
  "l,8,9;",
  "l,9,10;",
  "l,10,11;",
  "l,11,12;",
  "l,12,13;",
  "l,13,14;",
  "l,14,15;",
  "l,15,8;",


  // v16 - v29 sparks
  "v,33,15,1.0,0.0,0.0;",
  "v,36,18,1.0,1.0,0.0;",

  "v,33,19,1.0,0.0,0.0;",
  "v,36,19,1.0,1.0,0.0;",

  "v,37,23,1.0,0.0,0.0;",
  "v,37,20,1.0,1.0,0.0;",

  "v,41,23,1.0,0.0,0.0;",
  "v,38,20,1.0,1.0,0.0;",

  "v,41,19,1.0,0.0,0.0;",
  "v,38,19,1.0,1.0,0.0;",

  "v,41,15,1.0,0.0,0.0;",
  "v,38,18,1.0,1.0,0.0;",

  "v,37,15,1.0,0.0,0.0;",
  "v,37,18,1.0,1.0,0.0;",

  "l,16,17;",
  "l,18,19;",
  "l,20,21;",
  "l,22,23;",
  "l,24,25;",
  "l,26,27;",
  "l,28,29;",





  // v30 - v33
 
  "v,36,18,1.0,1.0,0.0;",
  "v,36,20,1.0,1.0,0.0;",
  "v,38,20,1.0,1.0,0.0;",
  "v,38,18,1.0,1.0,0.0;", // yellow square
  
  "l,30,31;",
  "l,31,32;",
  "l,32,33;",
  "l,33,30;",

  
  // v34 - v35
  "v,32,24,0.0,0.0,0.0;",
  "v,37,19,0.0,0.0,0.0;", // black diagonal line
  "l,34,35;",

  // v36 - v40
  "v,24,29,0.0,0.0,0.0;", // 36
  "v,23,35,0.0,0.0,0.0;",
  "v,28,40,0.0,0.0,0.0;",
  "v,35,40,0.0,0.0,0.0;", // 39
  "v,30,35,0.0,0.0,0.0;", // black triangles

  "t,36,37,40;",
  "t,37,38,40;",
  "t,38,39,40;",

  // v41 - v43
  "v,27,26,0.2,0.2,0.2;", // 41
  "v,32,30,0.2,0.2,0.2;", // 42
  "v,38,36,0.2,0.2,0.2;", // 43
  "t,36,42,41;",
  "t,36,39,42;",
  "t,42,39,43;",

  // v44 - v45
  "v,34,25,0.4,0.4,0.4;", 
  "v,39,30,0.4,0.4,0.4;", 
  "t,41,42,44;",
  "t,44,42,45;",
  "t,42,43,45;",

  // v46 - v49
  "v,29,31,1.0,1.0,1.0;",
  "v,29,33,0.0,1.0,0.0;",
  "v,33,31,1.0,1.0,1.0;",
  "v,33,33,0.0,1.0,0.0;",

  "l,46,47;",
  "l,48,49;",


].join("\n");


// DO NOT CHANGE ANYTHING BELOW HERE
export { Rasterizer, Framebuffer, DEF_INPUT };

