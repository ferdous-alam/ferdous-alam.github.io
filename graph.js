// Set up the canvas dimensions
var width = 800;
var height = 600;

// Create the SVG canvas
var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

// Create the data for the tree nodes
var data = {
  "name": "Parent",
  "children": [
    {
      "name": "Child 1",
      "children": [
        {"name": "Grandchild 1"},
        {"name": "Grandchild 2"}
      ]
    },
    {
      "name": "Child 2",
      "children": [
        {"name": "Grandchild 3"},
        {"name": "Grandchild 4"}
      ]
    }
  ]
};

// Create the hierarchical layout
var hierarchy = d3.hierarchy(data);

// Create the tree layout
var tree = d3.tree()
             .size([width, height]);

// Assign the x and y coordinates to each node
var nodes = tree(hierarchy);

// Draw the links between the nodes
var link = svg.selectAll(".link")
              .data(nodes.descendants().slice(1))
              .enter()
              .append("line")
              .attr("class", "link")
              .attr("x1", function(d) { return d.x; })
              .attr("y1", function(d) { return d.y; })
              .attr("x2", function(d) { return d.parent.x; })
              .attr("y2", function(d) { return d.parent.y; });

// Draw the nodes
var node = svg.selectAll(".node")
              .data(nodes.descendants())
              .enter()
              .append("g")
              .attr("class", "node")
              .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

// Draw the circles for each node
node.append("circle")
    .attr("r", 10);

// Draw the text labels for each node
node.append("text")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(function(d) { return d.data.name; });
