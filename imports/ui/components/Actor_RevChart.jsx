import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import ReactDOM from 'react-dom';

export default class ActorRevChart extends Component {

    componentDidMount() {
        // Instead of using render like in App.jsx, we use a method to draw the graph
        // This is because d3 graphs have to be created step by step
        // Our data is given as this.props.data because that's how it was passed in App.jsx
        // We can use this.props.actor to get the actor name
        this.drawChart(this.props);
    }

    // React method that determines whether a component should update, based on props/state
    // Returns true or false
    shouldComponentUpdate(nextProps, nextState) {
        if (this.props != nextProps && this.props != undefined) {
            console.log("thisProps", this.props, "nextProps", nextProps);

            // We extend a function just to determine whether something exists
            $.fn.exists = function () {
                return this.length !== 0;
            }

            // Lets us decide whether to update the graph or draw a new one
            // We sort of violate React rules by using functions to draw/update
            // However, this is a workaround because of d3
            if ($(".rev-graph").exists()) {
                // console.log("Rev update 0");
                this.updateChart(nextProps);
            }
            return true;
        }
        return false;
    }

    updateChart(newProps) {
        // Redefine margins
        var margin = {top: 40, right: 40, bottom: 30, left: 60},
            width = ((5 * 1382)/12) - margin.left - margin.right - 9.375*2,
            height = (693 / 2.25) - margin.top - margin.bottom + 9;

        // If we want to make a copy to mess around
        var data_copy = newProps.data;

        // Scale the range of the data again and define axes 
        var x = d3.time.scale().range([0, width]);
        var y = d3.scale.linear().range([height, 0]);
        x.domain(d3.extent(data_copy, function(d) { 
            return d.date; 
        }));
        y.domain(d3.extent(data_copy, function(d) { 
            return d.revenues; 
        }));
        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(6);
        var yAxis = d3.svg.axis().scale(y).orient("left");

        // Recalculate the line and area
        var line = d3.svg.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.revenues); }); 
        var area = d3.svg.area()
            .x(function(d) { return x(d.date); })
            .y0(height)
            .y1(function(d) { return y(d.revenues); });

        // Follow the Mouse
        var parseDate = d3.time.format("%d-%b-%y").parse,
            formatDate = d3.time.format("%d-%b"),
            bisectDate = d3.bisector(function(d) { return d.date; }).left;

        // Grid lines
        function make_y_axis() {        
            return d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(10)
        }

        // Select the section we want to apply our changes to
        var svg = d3.select(".vis2").transition();
            // Make the changes
            svg.select(".valueline") // change the line
                .duration(750)
                .attr("d", line(data_copy));
            svg.select("path")
                .duration(750)
                .attr("d", area(data_copy));
            svg.select(".x.axis") // change the x axis
                .duration(750)
                .call(xAxis);
            svg.select(".y.axis") // change the y axis
                .duration(750)
                .call(yAxis);
            svg.select(".grid")
                .duration(750)
                .call(make_y_axis()
                    .tickSize(-width, 0, 0)
                    .tickFormat("")
                );
            svg.select(".title")
                .duration(1000)
                .text(newProps.actor + " Revenue");
            svg.selectAll(".point")
                .duration(750)
                .remove();

        d3.select(".vis2 svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
            
        // We add points again
        var points = d3.select(".vis2").select(".svg-color").select("g")
        points.selectAll(".points")
            .data(data_copy)
            .enter().append("svg:circle")
            .attr("stroke", "#45A7E9")
            .attr("fill", "#45A7E9")
            .attr("class", "point")
            .attr("cx", function(d, i) { return x(d.date) })
            .attr("cy", function(d, i) { return y(d.revenues) })
            .attr("r", 3)
            .on("mouseover", function(d) {   
                div.transition()    
                    .duration(50)        
                })          
            .on("mouseout", function(d) {   
                div.transition()    
                    .duration(100)    
                    .style("opacity", 0); 
                });      

        // Selectors for updating
        var focus = d3.select(".vis2").select(".svg-color").select(".focus");
        var div = d3.select(".vis2").select("div");

        // Append circles for the line
        focus.select("circle")
            .remove();
        focus.append("circle")
            .attr("class", "circle_rev")
            .style("fill", "#45A7E9")
            .style("stroke", "#45A7E9")
            .attr("r", 6);

        // Update tooltip rect
        d3.select(".vis2").select(".svg-color").select("rect")
            .on("mousemove", function () {
                // Find the closest date to mouse
                var x0 = x.invert(d3.mouse(this)[0]);
                var i = bisectDate(data_copy, x0, 1);
                var d0 = data_copy[i - 1];
                var d1 = data_copy[i];
                var data = x0 - d0.date > d1.date - x0 ? d1 : d0;
                var lowestScore = [];
                var combined_tooltips = '';

                // Display the points for each line if visible
                focus.select("circle.circle_rev")
                    .transition().duration(50)
                    .attr("transform",
                          "translate(" + x(data.date) + "," +
                                         y(data.revenues) + ")");

                var imgUrl = '';
                try {
                    if (data.img[0] == 'h') {
                        imgUrl = data.img
                    }
                    else {
                        imgUrl = 'none.jpg'
                    }
                } 
                catch(e) {
                    imgUrl = 'none.jpg'
                }

                var tooltipText = "<div class='tooltip-rev'>" + data.film + "<br>" + "<b>$" + data.revenues + "M</b>" + "<br/>" + "<img class='toolimg' src=" + imgUrl + ">" + "</div>";

                // Clear existing tooltip HTML
                div.html('');

                // Actual transition
                div.transition()    
                    .duration(100)    
                    .style("opacity", .9);    
                div.html(tooltipText)
                    .style("left", (d3.mouse(this)[0]) + "px")   
                    .style("top", (d3.mouse(this)[1] + height + "px"));
            });
    }

    drawChart(props) {
        // Set margins for the SVG 
        var margin = {top: 40, right: 40, bottom: 30, left: 60},
            width = ((5 * 1382)/12) - margin.left - margin.right - 9.375*2,
            height = (693 / 2.25) - margin.top - margin.bottom + 9;
        
        // Graph housekeeping for scales and axes
        var formatDate = d3.time.format("%d-%b-%y");
        var formatTime = d3.time.format("%B %e, %Y");
        var x = d3.time.scale().range([0, width]);
        var y = d3.scale.linear().range([height, 0]);
        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(6);
        var yAxis = d3.svg.axis().scale(y).orient("left");
        var line = d3.svg.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.revenues); });
        
        // Append the SVG 
        var svg = d3.select(".vis2").append("svg")
            .attr("class", "svg-color rev-graph")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Adds area to chart
        var area = d3.svg.area()
            .x(function(d) { return x(d.date); })
            .y0(height)
            .y1(function(d) { return y(d.revenues); });

        // Follow the Mouse
        var parseDate = d3.time.format("%d-%b-%y").parse,
            formatDate = d3.time.format("%d-%b"),
            bisectDate = d3.bisector(function(d) { return d.date; }).left;

        // Copy the data if we want to mess around with it
        var data_copy = props.data;

        // Append tooltip
        var div = d3.select(".vis2").append("div") 
            .attr("class", "tooltip")
            // .attr("class", "tooltip2")         
            .style("opacity", 0);

        // Let's actually make the d3 graph
        x.domain(d3.extent(props.data, function(d) { 
            return d.date; 
        }));
        y.domain(d3.extent(props.data, function(d) { 
            return d.revenues; 
        }));

        // Add axes and area and line to the graph
        svg.append("path")
            .datum(props.data)
            .attr("class", "area")
            .attr("d", area);
        svg.append("g")
            .attr("class", "x axis noselect")
            .attr("transform", "translate(0,250)")
            .call(xAxis);
        svg.append("g")
            .attr("class", "y axis noselect")
            .call(yAxis)
            .append("text")
            .attr("dx", "0.25em")
            .attr("dy", "-2.75em")
            .style("text-anchor", "end")
            .style("font-weight", "bold")
            .attr("transform", "rotate(-90)")
            .text("Revenue ($M)");
        svg.append("path")
            .datum(props.data)
            .attr("class", "valueline")
            .style("stroke", "#45A7E9")
            .attr("d", line);
        svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", 0 - (margin.top / 2.5))
            .attr("class", "title noselect")
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("font-weight", "bold")
            .text(props.actor + " Revenue");

        // Grid lines
        function make_y_axis() {        
            return d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(10)
        }

        // Make the grid appear
        svg.append("g")         
            .attr("class", "grid")
            .call(make_y_axis()
                .tickSize(-width, 0, 0)
                .tickFormat("")
            );

        // Baseline for mouse following
        var focus = svg.append("g")
            .attr("class", "focus") 
            .style("display", "none");
        
        // Append circles for each line
        focus.append("circle")
            .attr("class", "circle_rev")
            .style("fill", "#45A7E9")
            .style("stroke", "#45A7E9")
            .attr("r", 6);

        // Append the rectangle to capture mouse
        // Tooltip moves with the mouse
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "rect")
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function() { 
                focus.style("display", null); 
            })
            .on("mouseleave", function() { 
                div.style("opacity", 0);
                focus.style("display", "none"); 
            })
            .on("mousemove", function () {
                // Find the closest date to mouse
                var x0 = x.invert(d3.mouse(this)[0]);
                var i = bisectDate(data_copy, x0, 1);
                var d0 = data_copy[i - 1];
                var d1 = data_copy[i];
                var data = x0 - d0.date > d1.date - x0 ? d1 : d0;
                var lowestScore = [];
                var combined_tooltips = '';

                // Display the points for each line if visible
                focus.select("circle.circle_rev")
                    .transition().duration(50)
                    .attr("transform",
                          "translate(" + x(data.date) + "," +
                                         y(data.revenues) + ")");

                var imgUrl = '';
                try {
                    if (data.img[0] == 'h') {
                        imgUrl = data.img
                    }
                    else {
                        imgUrl = 'none.jpg'
                    }
                } 
                catch(e) {
                    imgUrl = 'none.jpg'
                }

                var tooltipText = "<div class='tooltip-rev'>" + data.film + "<br>" + "<b>$" + data.revenues + "M</b>" + "<br/>" + "<img class='toolimg' src=" + imgUrl + ">" + "</div>";

                // Clear existing tooltip HTML
                div.html('');

                // Actual transition
                div.transition()    
                    .duration(100)    
                    .style("opacity", .9);    
                div.html(tooltipText)
                    .style("left", (d3.mouse(this)[0]) + "px") 
                    .style("top", (d3.mouse(this)[1] + height + "px"));
            });
        
        // Finally add points and make them animate!
        var points = svg.selectAll(".point")
            .data(props.data)
            .enter().append("svg:circle")
            .attr("stroke", "#45A7E9")
            .attr("fill", "#45A7E9")
            .attr("class", "point")
            .attr("cx", function(d, i) { return x(d.date) })
            .attr("cy", function(d, i) { return y(d.revenues) })
            .attr("r", 3)
            .on("mouseover", function(d) {   
                div.transition()    
                    .duration(50)        
                })          
            .on("mouseout", function(d) {   
                div.transition()    
                    .duration(100)    
                    .style("opacity", 0); 
                });
        
    }

    render() {
        return null;
    }
}

ActorRevChart.propTypes = {
    // This component gets the data to display through a React prop.
    // We can use propTypes to indicate it is required
    data: PropTypes.array.isRequired,
    actor: PropTypes.string.isRequired,
};