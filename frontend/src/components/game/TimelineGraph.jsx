import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import * as d3 from 'd3';

/**
 * TimelineGraph Component
 * Visualizes timelines and their relationships using D3
 */
const TimelineGraph = ({ timelines, selectedTimelineId, onSelectTimeline }) => {
  const svgRef = useRef(null);
  const theme = useTheme();
  
  // Process data for visualization
  const processData = () => {
    if (!timelines || timelines.length === 0) return { nodes: [], links: [] };
    
    // Create nodes for each timeline
    const nodes = timelines.map(timeline => ({
      id: timeline.id,
      name: timeline.name,
      type: timeline.type,
      stability: timeline.stability,
      techLevel: timeline.techLevel,
      karmaAlignment: timeline.karmaAlignment,
      realmCount: timeline.realms ? timeline.realms.length : 0
    }));
    
    // Create links between timelines (for demonstration, connect adjacent timelines)
    const links = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      // Create links based on some relationship logic
      // For now, we'll just connect adjacent timelines
      links.push({
        source: nodes[i].id,
        target: nodes[i + 1].id,
        value: Math.floor(Math.random() * 10) + 1 // Random strength for demonstration
      });
      
      // Add some cross-links for more interesting visualization
      if (i < nodes.length - 2 && i % 2 === 0) {
        links.push({
          source: nodes[i].id,
          target: nodes[i + 2].id,
          value: Math.floor(Math.random() * 5) + 1
        });
      }
    }
    
    return { nodes, links };
  };
  
  // D3 visualization
  useEffect(() => {
    if (!timelines || timelines.length === 0) return;
    
    const data = processData();
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = 400;
    
    // Clear previous visualization
    svg.selectAll("*").remove();
    
    // Create a force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));
    
    // Create links
    const link = svg.append("g")
      .attr("stroke", theme.palette.divider)
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));
    
    // Create a group for each node
    const node = svg.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .call(drag(simulation))
      .on("click", (event, d) => {
        if (onSelectTimeline) {
          onSelectTimeline(d.id);
        }
      });
    
    // Add circles to each node
    node.append("circle")
      .attr("r", 30)
      .attr("fill", d => getTimelineColor(d.type, theme))
      .attr("stroke", d => d.id === selectedTimelineId ? theme.palette.primary.main : theme.palette.background.paper)
      .attr("stroke-width", d => d.id === selectedTimelineId ? 3 : 1);
    
    // Add text to each node
    node.append("text")
      .text(d => d.name.split(' ')[0])
      .attr("x", 0)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", theme.palette.text.primary)
      .style("font-size", "10px")
      .style("pointer-events", "none");
    
    // Add stability indicator
    node.append("text")
      .text(d => `S: ${d.stability}%`)
      .attr("x", 0)
      .attr("y", 12)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", theme.palette.text.secondary)
      .style("font-size", "8px")
      .style("pointer-events", "none");
    
    // Update positions on each tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });
    
    // Drag functionality
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    
    // Handle window resize
    const handleResize = () => {
      simulation.force("center", d3.forceCenter(svgRef.current.clientWidth / 2, height / 2));
      simulation.alpha(0.3).restart();
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      simulation.stop();
    };
  }, [timelines, selectedTimelineId, theme, onSelectTimeline]);
  
  // Get color based on timeline type
  const getTimelineColor = (type, theme) => {
    const colors = {
      'Utopia': theme.palette.success.light,
      'Dystopia': theme.palette.error.light,
      'Tech Empire': theme.palette.info.light,
      'Earth Roots': theme.palette.warning.light,
      'AI Matrix': theme.palette.secondary.light,
      'Cosmic Plane': theme.palette.primary.light
    };
    
    return colors[type] || theme.palette.grey[500];
  };
  
  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3, height: '450px' }}>
      <Typography variant="h6" gutterBottom>
        Timeline Network
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Visualizing connections between alternate timelines. Click on a timeline to view details.
      </Typography>
      <Box sx={{ width: '100%', height: '350px', overflow: 'hidden' }}>
        <svg ref={svgRef} width="100%" height="100%" />
      </Box>
    </Paper>
  );
};

export default TimelineGraph;
