function shepcanvas(canvas,w,h,options) {
  this.canvas=canvas;
  w=w||480;
  h=h||360;
  options=options||{};
  this.width=w;
  this.height=h;
  this.canvas.width=this.canvas.width;
  var c=this.canvas.getContext('2d'),
  pxr=(_=>{
    var ctx=document.createElement("canvas").getContext("2d"),
    dpr=window.devicePixelRatio||1,
    bsr=ctx.webkitBackingStorePixelRatio||
      ctx.mozBackingStorePixelRatio||
      ctx.msBackingStorePixelRatio||
      ctx.oBackingStorePixelRatio||
      ctx.backingStorePixelRatio||1;
    return dpr/bsr;
  })();
  this.canvas.width=w*pxr;
  this.canvas.height=h*pxr;
  this.canvas.style.width=w+'px';
  this.canvas.style.height=h+'px';
  (this.clearcanvas=_=>{ // clear is reserved for smth else, apparently
    this.canvas.width=this.canvas.width;
    if (options.positive&&!options.centre) c.translate(0,canvas.height);
    else c.translate(w*pxr/2,canvas.height-h*pxr/2);
    c.scale(pxr,-pxr);
    c.lineCap='round';
    c.lineJoin='round';
  })();
  this.line=function(options) {
    if (options.fill) {
      c.fillStyle=options.fill;
      c.beginPath();
      c.moveTo(arguments[1][0],arguments[1][1]);
      for (var i=2;i<arguments.length;i++) c.lineTo(arguments[i][0],arguments[i][1]);
      c.fill();
    } else {
      if (options.colour) c.strokeStyle=options.colour;
      if (options.size) c.lineWidth=options.size;
      c.beginPath();
      if (arguments.length>2) {
        c.moveTo(arguments[1][0],arguments[1][1]);
        for (var i=2;i<arguments.length;i++) c.lineTo(arguments[i][0],arguments[i][1]);
        c.stroke();
      }
      else {
        c.fillStyle=options.colour;
        c.arc(arguments[1][0],arguments[1][1],(options.size||1)/2,0,2*Math.PI);
        c.fill();
      }
    }
  };
  this.fill=function(options) {
    if (options.fill) c.fillStyle=options.fill;
    c.beginPath();
    c.moveTo(arguments[1][0],arguments[1][1]);
    for (var i=2;i<arguments.length;i++) c.lineTo(arguments[i][0],arguments[i][1]);
    c.fill();
  };
  this.path=(options,path)=>{
    // https://developer.mozilla.org/en-US/docs/Web/API/Path2D/Path2D#Using_SVG_paths
    var p=new Path2D(path);
    if (options.fill) {
      c.fillStyle=options.fill;
      c.fill(p);
    }
    if (options.stroke||options.strokewidth) {
      if (options.stroke) c.strokeStyle=options.stroke;
      else c.strokeStyle='black';
      if (options.strokewidth) c.lineWidth=options.strokewidth;
      else c.lineWidth=1;
      c.stroke(p);
    }
  };
  this.sin=a=>Math.sin(a*(Math.PI/180));
  this.cos=a=>Math.cos(a*(Math.PI/180));
  this.tan=a=>Math.tan(a*(Math.PI/180));
  this.rand=(a,b)=>Math.floor(Math.random()*a+(b||0));
  var pixelid=c.createImageData(1,1);
  this.pixel=(x,y,rgba)=>{
    if (rgba) {
      if (rgba.r) {
        rgba=[rgba.r,rgba.g,rgba.b,rgba.a];
      }
      rgba[3]/=255;
      pixelid.data=rgba;
      // for (var i=0;i<4;i++) pixelid.data[i]=rgba[i];
      c.putImageData(pixelid,x,y);
    } else {
      var t=c.getImageData(x,y,1,1).data;
      return {r:t[0],g:t[1],b:t[2],a:t[3]/255};
    }
  };
  var images={};
  if (options.images) {
    for (var name in options.images) {
      images[name]=new Image();
      images[name].src=options.images[name];
      images[name].style.display='none';
    }
  }
  this.img=(x,y,url,src)=>{
    if (src) {
      var img=new Image();
      img.src=url;
      img.style.display='none';
      img.onload=e=>c.drawImage(img,x,y);
    }
    else c.drawImage(images[url],x,y);
  };
}
