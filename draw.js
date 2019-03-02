function drawEdges(whatPhase) 
{ 
	if (whatPhase === phases.solution) { 
		fill(250)
		stroke(220); 
		strokeWeight(3);
	}

	for(var i=0; i<connectors.length; i++) 
	{ 
		if(connectors[i].highLight === true && whatPhase === phases.construction) 
		{
			stroke(150, 150, 250); 
			strokeWeight(6);		
		}
		else if(whatPhase === phases.construction) { 
			stroke(150, 100, 150); 
			strokeWeight(3);
		}

		line(connectors[i].begin.x, connectors[i].begin.y, connectors[i].end.x, connectors[i].end.y); 
		

		//drawing an arrow as directed path 
		// push() //start new drawing state
		
		// fill(100); 
		// stroke(100);
		// strokeWeight(1); 

		// var offset = 15; 
	 //    var angle = atan2(connectors[i].begin.y - connectors[i].end.y, connectors[i].begin.x - connectors[i].end.x); //gets the angle of the line
	 //    translate(connectors[i].end.x, connectors[i].end.y); //translates to the destination vertex
	 //    rotate(angle - HALF_PI); //rotates the arrow point
	 //    triangle(-offset/2, offset/2, offset/2, offset/2, 0, -offset/2); //draws the arrow point as a triangle
	    
	 //    pop();
	}

	var x, y; 
	for(var i=0; i<connectors.length; i++) 
	{ 
		if(whatPhase === phases.construction) 
		{ 
			fill(200, 150, 250);

			if(connectors[i].highLight === true) stroke(150, 150, 250); 
			else stroke(150, 100, 150); 

			strokeWeight(3);
		}
		else 
		{ 
			fill(250)
			stroke(220); 
			strokeWeight(3);
		}

		x = connectors[i].end.x + (connectors[i].begin.x - connectors[i].end.x)/2; 
		y = connectors[i].end.y + (connectors[i].begin.y - connectors[i].end.y)/2; 

		ellipse(x, y, edgeEllipseRadius, edgeEllipseRadius); 
	
		if(whatPhase === phases.construction) 
		{ 
			fill(100, 75, 100);
			stroke(100, 75, 100);
			strokeWeight(1);  
		}
		else 
		{ 
			fill(100);
			stroke(100);
			strokeWeight(1);	
		}
		textSize(10); 
		fontWidth = textWidth(String(connectors[i].weight));
		text(connectors[i].weight, x - fontWidth/2, y + 4);  
	}
}

function drawUnFinishedEdge() 
{ 
	fill(200, 150, 250); 
	stroke(150, 100, 150); 
	strokeWeight(3);	
	if(connectRouters.length === 1) 
	{
		line(connectRouters[0].x, connectRouters[0].y, mouseX, mouseY);	
	}
}

function drawRouters() 
{ 
	var srcOrDest = false; 

	if(routers.length === 0 || !routers) return; 
	for (var i=0;i<routers.length;i++)
	{
		 srcOrDest = (sourceName == routers[i].name || 
		 		 	  destName == routers[i].name) ? 
		 			  true : false; 

		// image(routers[i].img , routers[i].x, routers[i].y, imgDim, imgDim);		
		if(srcOrDest)
		{ 
			if(sourceName == routers[i].name) stroke(200, 0, 0);
			else stroke(0, 200, 0);  
			strokeWeight(4);
		}
		else 
		{ 
			stroke(150, 150, 75); 
			strokeWeight(4); 
		}
		
		fill(220, 220, 110); 	
		
		ellipse(routers[i].x, routers[i].y, routerEllipseRadius, routerEllipseRadius);
		// image(img, routers[i].x - imgdim/2, routers[i].y - imgdim/2, imgdim, imgdim);
		
		fill(0); stroke(100);
		
		strokeWeight(0.5);  			
		textSize(14); 
		fontWidth = textWidth(routers[i].name);
		text(routers[i].name, routers[i].x - fontWidth/2, routers[i].y + 5);  
		
	}
}

function drawPermanent() 
{
	guiRoutesUpdate = []; 

	for(var item of permanent) 
	{
		guiRoutesUpdate.push(item); 


		if(item === undefined) break; 
		if(item.prev === -1) 
			continue;

		fill(150, 150, 75); 
		stroke(150, 150, 75); 
		strokeWeight(3); 

		line(item.prev.x, item.prev.y, item.x, item.y);

		edge = getEdge(item, item.prev);  
		x = edge.end.x + (edge.begin.x - edge.end.x)/2; 
		y = edge.end.y + (edge.begin.y - edge.end.y)/2; 


		fill(150, 150, 75); 
		stroke(100, 100, 50); 
		strokeWeight(3);

		ellipse(x, y, edgeEllipseRadius, edgeEllipseRadius); 
		
		fill(255);
		stroke(255);
		strokeWeight(1);
		textSize(10); 

		// console.log("EDGE IS:::::::::", edge); 
		fontWidth = textWidth(String(edge.weight));
		text(edge.weight, x - fontWidth/2, y + 4);

	}

	table = ""; 
	for(var i=0; i<guiRoutesUpdate.length; i++) { 
		table += ((guiRoutesUpdate[i].prev.name !== undefined)? 
				  guiRoutesUpdate[i].prev.name : "S") + "\t-\t" + guiRoutesUpdate[i].name;

		table += "\tcost: "+item.distance + "\n"; 
	}
	console.log(table); 
	console.log("=================================");
}

function drawSrcDestPath() 
{ 
	var temp = destination; 

	destSrcTable = []; 

	while(routers[temp].prev !== -1) 
	{
		destSrcTable.push(temp);

		fill(125, 100, 125); 
		stroke(125, 100, 125); 
		strokeWeight(3); 
		
		line(routers[temp].prev.x, routers[temp].prev.y, routers[temp].x, routers[temp].y);

		edge = getEdge(routers[temp], routers[temp].prev);  
		x = edge.end.x + (edge.begin.x - edge.end.x)/2; 
		y = edge.end.y + (edge.begin.y - edge.end.y)/2; 


		fill(150, 100, 150); 
		stroke(125, 100, 125); 
		strokeWeight(3);

		ellipse(x, y, edgeEllipseRadius, edgeEllipseRadius); 
		
		fill(255);
		stroke(255);
		strokeWeight(0.5);
		// noStroke();
		textSize(11); 

		// console.log("EDGE IS:::::::::", edge); 
		fontWidth = textWidth(String(edge.weight));
		text(edge.weight, x - fontWidth/2, y + 4);

		fill(150, 100, 150); 
		stroke(125, 100, 125); 	
		strokeWeight(4); 
		
		ellipse(routers[temp].x, routers[temp].y, routerEllipseRadius, routerEllipseRadius);
		
		fill(255); 
		
		noStroke(); 
		textSize(14); 
		fontWidth = textWidth(routers[temp].name);
		text(routers[temp].name, routers[temp].x - fontWidth/2, routers[temp].y + 5);

		temp = getIndex(routers, routers[temp].prev); 		
	} 

	destSrcTable.push(temp); 

	fill(150, 100, 150); 
	stroke(130, 100, 130); 	
	strokeWeight(4); 
	ellipse(routers[temp].x, routers[temp].y, routerEllipseRadius, routerEllipseRadius);

	fill(255); 
	
	noStroke(); 
	textSize(14); 
	fontWidth = textWidth(routers[temp].name);
	text(routers[temp].name, routers[temp].x - fontWidth/2, routers[temp].y + 5);

	var table = ""; 
	for(var i= destSrcTable.length-1; i >= 0; i--) { 
		// console.log(routers[destSrcTable[i]]); 
		name = 	routers[destSrcTable[i]].name + " - " + 
		   		((routers[destSrcTable[i]].prev.name !== undefined) ? 
		   		routers[destSrcTable[i]].prev.name : "S");
		table += name + "\t" + "cost: " + routers[destSrcTable[i]].distance + "\n"; 
	}
	console.log(table); 
}

function getEdge(r1, r2) 
{
	// console.log("input", r1, r2); 
	for(var i=0; i<connectors.length; i++) 
	{ 
		// console.log("edges", connectors[i].startRouter, connectors[i].endRouter);

		if((connectors[i].startRouter.name === r1.name && connectors[i].endRouter.name === r2.name) ||
		  (connectors[i].startRouter.name === r2.name && connectors[i].endRouter.name === r1.name))
			return connectors[i] 
	}
	return null; 
}

function drawGrid() 
{ 
	gridTiles = 5; 

	tint(255, 100); //image transperancy from 255 to 150; 
	for(var i=0; i<= gridTiles; i++) { 
		image(gridImage, i * gridImage.width, 0);
		image(gridImage, i * gridImage.width, gridImage.height);
	}
}