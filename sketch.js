const Inifinity = Number.MAX_VALUE;
const constructionROF = 13; 
const phases = { construction: 1, solution: 2 };

var deletingFlag = false; 

var solved = false; 

var routers=[];
var connectors = [];

var edgeIndex; 

var connectRouters = []; 
var intersectionPoints = []; 

var isEnabled = { routers: true, edges: false, spaceTrigStep: false }; 

var routersMap = new Array(); 
var permanent = new Set(); 
var tentative = new Set();

var source; 
var destination; 

var sourceName = "";
var destName =  ""; 

var chooseSourceFlag = false; 
var chooseDestFlag = false; 

var heightMargin = 20;
var widthOfWindow = 2010; 

var canvas; 
var rateOfFrames = 1; 

var edgeEllipseRadius = 30;  
var routerEllipseRadius = 50; 

var dragLock = { lock: false, index: -1, mousePressed: false };

var gui; 

var guiRoutesUpdate = []; 

var gridImage; 

function setup() 
{
	
	canvas = createCanvas(widthOfWindow, windowHeight-heightMargin);
	canvas.mousePressed(setGraph);
	canvas.doubleClicked(doubleClick); 


	frameRate(constructionROF);

	canvas.mouseMoved(edgeHighLight); 

	gridImage = loadImage("pic/grid.png"); 

	gui = createGUI(); 
}

function dijkstraOneLoopLogic() 
{ 
	permanent.add(routers[source]); 
	tentative.delete(routers[source]); 

	for (var item of routers[source].neighbors) {	
		if(permanent.has(item)) {
			continue; 
		}
		tentative.add(item); 
	}

	tentative = update(tentative);

	source = getMin(tentative);

	permanent.add(routers[source]);
}


function draw() 
{
	background(255);
	
	drawGrid(); 

	if(!solved) 
	{ 
		frameRate(constructionROF); 
		drawEdges(phases.construction); 
		drawUnFinishedEdge();
		drawRouters();  
	}
	//solution loop. 
	//TODO: function to reset the graph to draw from all over again 
	else 
	{	
		frameRate(rateOfFrames); 
		drawEdges(phases.solution);
		drawPermanent(); 

		console.log("Source:", source === destination); 
		if((tentative.size !== 0 || source !== -1) && source !== destination) 
		{ 
			dijkstraOneLoopLogic(); 
			drawRouters();
		}

		else
		{ 
			// routers.forEach(function(e) { 
			// 	console.log(e.name, e.distance); 
			// }) 
			// drawPermanent();
			drawEdges(phases.solution);
			drawRouters();  
			drawSrcDestPath(); 
			noLoop(); 
		}
	}

}

function getMin(tentative) 
{ 
	var min = Inifinity;

	var newsrc = -1; 

	for(var item of tentative) { 
		
		if(permanent.has(item)) continue; 
		
		if(item.distance < min) { 
			min = item.distance; 
			newsrc = routers.indexOf(item); 
		}
	}
	
	return newsrc;  
}


function update(tentative) 
{ 
	var newTent = new Set(); 

	var routerIndex;

	var router;

	var d;	

	for(let item of tentative) { 	
		if(permanent.has(item)) continue; 

		routerIndex = routers.indexOf(item);
		router = routers[routerIndex]; 

		d = routersMap[source][routerIndex] + routers[source].distance;  
 
		stroke(0, 200, 0); 
		strokeWeight(3); 
		
		if(d < item.distance) { 
			router.distance = d;
			router.prev = routers[source]; 
			routers[routerIndex] = router;  
			
			line(item.prev.x, item.prev.y, item.x, item.y); 

		}
		// console.log(router); 
		newTent.add(router); 
	}	

	return newTent; 
}


function Router(name, x, y) 
{
	this.name = name; 
	this.x = x;
	this.y = y;

	this.prev = -1; 
	this.distance = Inifinity; 
	this.neighbors = new Set(); 

	return this;
}


function setGraph() { 
	if(solved) 
	{ 
		resetAll();
		return; 
	}
	

	if (isEnabled.routers && !dragLock.mouseReleased) {
		for(var i=0; i<routers.length; i++) 
		{ 
			var a = { 
				left: mouseX - routerEllipseRadius /2, 
				right: mouseX + routerEllipseRadius /2, 
				top: mouseY - routerEllipseRadius /2, 
				bottom: mouseY + routerEllipseRadius /2
			}
			var b = { 
				left: routers[i].x - routerEllipseRadius /2, 
				right: routers[i].x + routerEllipseRadius /2, 
				top: routers[i].y - routerEllipseRadius /2, 
				bottom: routers[i].y + routerEllipseRadius /2
			}

			if(intersectRect(a, b)) {
				dragLock = { lock: true, index: i, mouseReleased: false };
				break; 
			}
		}
		//ellipse(mouseX, mouseY, 80, 80);
		//image(img, mouseX, mouseY, 80, 80);
		var newRouter = true; 
		for(var i=0; i<routers.length; i++) { 
			var a = { 
				left: mouseX - routerEllipseRadius /2 - edgeEllipseRadius/2, 
				right: mouseX + routerEllipseRadius /2 + edgeEllipseRadius/2, 
				top: mouseY - routerEllipseRadius /2 - edgeEllipseRadius/2, 
				bottom: mouseY + routerEllipseRadius /2 + edgeEllipseRadius/2
			}
			var b = { 
				left: routers[i].x - routerEllipseRadius /2 - edgeEllipseRadius/2, 
				right: routers[i].x + routerEllipseRadius /2 + edgeEllipseRadius/2, 
				top: routers[i].y - routerEllipseRadius /2 - edgeEllipseRadius/2, 
				bottom: routers[i].y + routerEllipseRadius /2 + edgeEllipseRadius/2
			}

			if(intersectRect(a, b)) { 
				newRouter = false; 
				break; 
			}
		}
		if(newRouter) 
		{
			routers.push(new Router("", mouseX,mouseY));
			routers[routers.length -1].name = "R"+ (routers.length -1); 
		}
	}

	else if (isEnabled.edges && !dragLock.mouseReleased) 
	{

		for (var i=0 ; i<routers.length; i++) 
		{
			if (intersect(routers[i], mouseX , mouseY)) 
			{
				connectRouters.push(routers[i]); 
				// intersectionPoints.push(new Vector(routers[i].x, routers[i].y)); 
			}

			if(connectRouters.length >= 2) break; 
		}
		if(connectRouters.length >= 2) 
		{ 
			var newEdge = true; 
			
			if(connectRouters[0] !== connectRouters[1])
			{
				for(var i = 0; i < connectors.length; i++) 
				{ 
					if(edgeExist(connectors[i], connectRouters)) 
					{ 
						newEdge = false; 
						break; 
					}
					else { newEdge = true; }
				}

				if(newEdge) 
				{ 
					var v1 = new Vector(connectRouters[0].x, connectRouters[0].y)
					var v2 = new Vector(connectRouters[1].x, connectRouters[1].y)

					connectors.push(
						new Line(v1, v2, connectRouters[0], connectRouters[1])
						);
					
					console.log("connectors.length:", connectors.length);
					edgeIndex = connectors.length - 1;
				}

				// if (connectors.length === 1) { 
				// 	edgeIndex = connectors.length - 1;
				// }
			}	
			
			connectRouters = [];
			intersectionPoints = [];   
		}

	}
	else dragLock.mouseReleased = fales; 
}

function removeEdgeById(array, index) 
{ 
	if(index > -1) 
		array.splice(index, 1); 
}

function edgeExist(edge, edgeRouters) 
{ 
	// console.log(connector, edgeRouters); 
	if((equalRouters(edge.startRouter, edgeRouters[0])  && equalRouters(edge.endRouter, edgeRouters[1])) || 
		(equalRouters(edge.startRouter, edgeRouters[1])  && equalRouters(edge.endRouter, edgeRouters[0])))
	{ 
		console.log(connectors.length); 
		return true; 
	}  
	return false; 
}

function equalRouters(r1, r2) 
{ 
	if((r1.x == r2.x) && (r1.y == r2.y)) 
	{ 
		// console.log(r1.name, r2.name); 
		return true; 
	} 
	return false; 
}

function doubleClick() 
{
	if(chooseSourceFlag || chooseDestFlag) 
	{ 
		var intersectRouter = -1; 
		for(var i=0; i<routers.length; i++)
		{
			var a = { 
				left: mouseX - routerEllipseRadius /2, 
				right: mouseX + routerEllipseRadius /2, 
				top: mouseY - routerEllipseRadius /2, 
				bottom: mouseY + routerEllipseRadius /2
			}
			var b = { 
				left: routers[i].x - routerEllipseRadius /2, 
				right: routers[i].x + routerEllipseRadius /2, 
				top: routers[i].y - routerEllipseRadius /2, 
				bottom: routers[i].y + routerEllipseRadius /2
			}

			if(intersectRect(a, b)) { 
				intersectRouter = i; 
				break; 
			}
		}

		if (chooseSourceFlag) 
			sourceName = routers[i].name; 
		
		if (chooseDestFlag) 
			destName = routers[i].name; 

		return; 
	}
	
	for(var i=0; i<connectors.length; i++)
	{ 
		if(isOnEdge(new Vector(mouseX, mouseY), connectors[i])) 
		{
			if(solved) { resetAll(); }

			else if(deletingFlag) { 
				removeEdgeById(connectors, i);
				break; 
			}

			connectors[i].highLight = true;
			var cost = prompt("Please enter path cost:", "1"); 

			if(isNaN(cost) || cost === "" || !cost) 
			{ 
				connectors[i].weight = 1; 
				alert("You have to put numberical value in this field." 
					 + "\nCost will be set to one (1) by default"); 
			}
			else 
			{ 
				connectors[i].weight = parseInt(cost); 
			}
		}
		else { 
			connectors[i].highLight = false; 
		}
	}
	if(connectRouters.length === 1) connectRouters = []; 
	// console.log(connectors); 
}


function mouseReleased () { 
	if(dragLock.lock) 
	{
		dragLock = { lock: false, index: -1 }
		connectRouters = [];   
		console.log("mouseReleased"); 	
	}
}

function mouseDragged() 
{
	if(dragLock.lock) 
	{ 
		for(var i=0; i<connectors.length; i++) 
		{ 
			if (connectors[i].startRouter === routers[dragLock.index])
				connectors[i].begin = new Vector(mouseX, mouseY); 
			
			else
			if (connectors[i].endRouter === routers[dragLock.index]) 
				connectors[i].end = new Vector(mouseX, mouseY); 
			 
		}

		routers[dragLock.index].x = mouseX; 
		routers[dragLock.index].y = mouseY; 
	}
}


function Line(beginVect, endVect, startRouter, endRouter) 
{ 
	this.begin = beginVect; 
	this.end = endVect;  
	
	this.weight = 1; 

	this.startRouter = startRouter; 
	this.endRouter = endRouter; 
	
	this.highLight = false; 

	return this; 
}

function intersect(router,x,y)
{
	if ((x <= router.x + routerEllipseRadius/2 && x >= router.x - routerEllipseRadius/2) && 
		(y >= router.y - routerEllipseRadius/2 && y<= router.y + routerEllipseRadius/2)) 
		return true;
	return false;
}

function Vector(x, y) 
{ 
	this.x = x; 
	this.y = y; 
	return this; 
}


function setChecked(prop) 
{ 
	for(var param in isEnabled) { 
		isEnabled[param] = false; 
	}
	isEnabled[prop] = true; 
}

function inArray(array, e)  
{
	var flag = false; 

	for(var i=0; i<routers.length; i++) 
	{ 
		if(e === routers[i].name) 
		{ 
			flag = true;
			break;   
		}
	}

	return flag; 
}

function getIndexByRouterName(array, routerName) 
{ 
	for(var i=0; i<array.length; i++) 
	{ 
		if(array[i].name === routerName) return i; 
	}
	return -1; 
}

function solve() 
{ 
	if(routers.length == 0 || connectors.length == 0)  
	{ 
		alert("Please draw the graph first then click solve"); 
		return; 
	}
	
	if(!inArray(routers, sourceName) || !inArray(routers, destName)) 
	{ 
		alert("Please set a source node and destination one!");
		return;
	}

	source = getIndexByRouterName(routers, sourceName); 
	destination = getIndexByRouterName(routers, destName); 
	
	if(!solved) 
	{ 
		solved = !solved; 
		// console.log("Clicked"); 
		routersMap = createMap();

		routers[source].distance = 0;
		tentative.add(routers[source]);   
	}

	else 
	{ 
		alert("Graph is already solved!"); 
	}
}


function resetAll() { 
	solved = false; 
	routers.forEach(function(e) { 
		e.distance = Inifinity; 
		e.prev = -1; 
		e.neighbors = new Set(); 
	})
	tentative = new Set(); 
	permanent = new Set();
	loop();  
}

function showHelp() 
{ 
	//here we could use jquery modals to show this help instead of alert.
	helpString = "This app was developed by Muhammad Abulmajd & Muhammad Medhat\n";

	helpString+= " - To choose a source hold the letter (s/S) down on your keyboard\n"; 
	helpString+= "	and double click on the wanted router\n";

	helpString+= " - To choose a destination hold the letter (d/D) down on your keyboard\n"; 
	helpString+= "	and double click on the wanted router\n"; 

	helpString+= " - To remove and edge that already been set into the graph\n"; 
	helpString+= "	hold the letter (r/R) down on your keyboard and double click on that edge.\n"; 
	helpString+= " - To remove an edge that connected to one router press escape."; 

	alert(helpString); 
}

function createGUI() 
{
	var gui = new dat.GUI({ autoPlace: true, name: "Dijkstra", width: 200, closeOnTop:true });

	// console.log(gui.domElement.style); 
	gui.domElement.style.float = "left";

	gui.add(window, 'showHelp').name("Help"); 

	gui.add(isEnabled, 'routers').name("Routers").listen().onChange(function() { setChecked('routers'); }); 
	gui.add(isEnabled, 'edges').name("Edges").listen().onChange(function() { setChecked('edges'); }); 

	gui.add(window, 'sourceName').name("Source").listen().onChange(function() {
		if(solved)
			resetAll();
	}); 
	gui.add(window, 'destName').name("Destination").listen().onChange(function() { 
		if(solved) 
			resetAll(); 
	}); 

	gui.add(window, 'rateOfFrames', 0.1, 10, 0.1).name("AnimationFPS"); 
	
	gui.add(window, 'solve').name("Solve");

	

	var routeCosts = gui.addFolder('Edges Costs');
	routeCosts.open(); 
	routeCosts.domElement.style.height = 100;

	routeCosts.parent = gui; 
	return routeCosts; 	
}

function sqr(x) 
{ 
	return x*x; 
}

//named dist2 as the p5js has dist function 
function dist2(v, w) 
{ 
	return sqr(v.x - w.x) + sqr(v.y - w.y);
}

function distToSegmentSquared(mousePos, edgeBegin, edgeEnd) 
{ 
	l2 = dist2(edgeBegin, edgeEnd); 
	if(l2 === 0) return dist2(mousePos, edgeBegin); 

    t = ((mousePos.x - edgeBegin.x) * (edgeEnd.x - edgeBegin.x) + 
    	(mousePos.y - edgeBegin.y) * (edgeEnd.y - edgeBegin.y)) / l2;

    if (t < 0) return dist2(mousePos, edgeBegin);
    if (t > 1) return dist2(mousePos, edgeEnd);
    
    return dist2(mousePos, 
    	new Vector(parseInt(edgeBegin.x + t * (edgeEnd.x - edgeBegin.x)), 
    		parseInt(edgeBegin.y + t * (edgeEnd.y - edgeBegin.y)))
    	);
}

function distToSegment(mousePos, edgeBegin, edgeEnd) 
{
    return parseInt(Math.sqrt(distToSegmentSquared(mousePos, edgeBegin, edgeEnd)));
}


function isOnEdge(mousePosition, edge) 
{

    dist = parseInt(distToSegment(mousePosition, edge.begin, edge.end));
    if (dist<7)
        return true;
 
    return false;
}

function edgeHighLight() 
{ 
	for(var i=0; i<connectors.length; i++)
	{ 
		if(isOnEdge(new Vector(mouseX, mouseY), connectors[i])) 
		{ 
			connectors[i].highLight = true; 
			// console.log("High Light", connectors[i]); 
		}
		else { 
			connectors[i].highLight = false; 
		}
	}

}

function keyPressed() 
{
	if (keyCode === ESCAPE) 
		connectRouters = []; 

	else if (keyCode === RIGHT_ARROW && isEnabled.spaceTrigStep)
		//TODO: add this feature 
	{ console.log("one step"); }
}

function keyTyped() { 
	if (key === 'r' || key === 'R') 
		deletingFlag = true;  

	else if (key === 's' || key === 'S') 
		chooseSourceFlag = true; 

	else if (key === 'd' || key === 'D') 
		chooseDestFlag = true; 
}

function keyReleased() { 
	if (key === 'r' || key === 'R') 
		deletingFlag = false; 

	else if (key === 's' || key === 'S') 
		chooseSourceFlag = false; 

	else if (key === 'd' || key === 'D') 
		chooseDestFlag = false; 
}

function createMap() 
{ 
	var routersCostMap = twoDimArray(routers.length); 

	for(var i=0; i<connectors.length; i++) 
	{ 
		var start = getIndex(routers, connectors[i].startRouter); 
		var end = getIndex(routers, connectors[i].endRouter); 
		
		routersCostMap[start][end] = connectors[i].weight; 
		routersCostMap[end][start] = connectors[i].weight; 

		routers[start].neighbors.add(routers[end]); 
		routers[end].neighbors.add(routers[start]); 
	}

	// console.log(routersCostMap); 
	// console.log(routers[start], routers[end]); 
	// console.log(routersCostMap);
	return routersCostMap; 
}

function getIndex(array, element) 
{ 
	return array.indexOf(element); 
}

function twoDimArray(size) 
{ 
	var array = new Array(size); 
	
	for(var i = 0; i < array.length; i++) { 
		array[i] = new Array(size); 
		for(var j=0; j < size; j++) { 
			array[i][j] = Inifinity; 
		}
	}
	
	return array; 
}

function intersectRect(r1, r2) {
  return !(r2.left > r1.right || 
           r2.right < r1.left || 
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
}