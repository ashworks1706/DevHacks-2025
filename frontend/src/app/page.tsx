'use client';

import { ChangeEvent, useState, useRef, useEffect } from 'react';
import { FiUpload } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { MarkerArea } from '@markerjs/markerjs3';


export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  
  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const leftSideRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const aiTextRef = useRef<HTMLElement>(null); // New ref for the AI text
  const uploadBoxRef = useRef<HTMLDivElement>(null);
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const instantlyFreeRef = useRef<HTMLSpanElement>(null);

  

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let restartTimeout: NodeJS.Timeout;

    const handleTimeUpdate = () => {
      if (video.currentTime >= 4) {
        video.pause();
        
        // Set timeout to restart after 5 seconds
        restartTimeout = setTimeout(() => {
          video.currentTime = 0;
          video.play();
        }, 5000);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      clearTimeout(restartTimeout);
    };
  }, []);

  // New useEffect for the animated gradient
  useEffect(() => {
    // First check if aiTextRef is populated
    if (!aiTextRef.current) {
      // If it's not populated, try to find it by ID
      const aiElement = document.getElementById('ai-text-element') as HTMLElement;
      if (aiElement) {
        aiTextRef.current = aiElement;
      } else {
        // If still not found, try to find the element with direct text matching
        const spans = document.querySelectorAll('b, span');
        for (const span of spans) {
          if (span.textContent === 'AI') {
            aiTextRef.current = span as HTMLElement;
            break;
          }
        }
      }
    }
    
    // Now check again if we have a reference
    if (!aiTextRef.current) return;
    
    // Add animation to the AI text
    const animateGradient = () => {
      const element = aiTextRef.current;
      if (!element) return;

      let hue = 0;
      
      const animate = () => {
        // Use a slower increment for smoother animation
        hue = (hue + 0.2) % 60; // Much smaller increment
        // Use purple shades - base is around 270 degrees in HSL
        const color1 = `hsl(${260 + hue/4}, 80%, 65%)`; // Lighter purple
        const color2 = `hsl(${280 + hue/4}, 90%, 45%)`; // Darker purple
        
        // Apply the gradient and make text transparent
        element.style.backgroundImage = `linear-gradient(45deg, ${color1}, ${color2})`;
        element.style.webkitBackgroundClip = 'text';
        element.style.backgroundClip = 'text';
        element.style.color = 'transparent';
        
        // Ensure the element is visible with proper CSS
        element.style.display = 'inline-block';
        element.style.opacity = '1';
        
        requestAnimationFrame(animate);
      };
      
      animate();
    };
    
    // Start the animation
    const animationId = requestAnimationFrame(animateGradient);
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("Selected file:", file);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file
      uploadFileAndNavigate(formData);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      console.log("Dropped file:", file);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file
      uploadFileAndNavigate(formData);
    }
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  // Function to handle sample image clicks
  async function handleSampleImageClick(imageNumber: number) {
    try {
      setUploading(true);
      const imagePath = `/images/test_pic${imageNumber}.png`;
      console.log("Selected sample image:", imagePath);
      
      // Fetch the sample image as a blob
      const response = await fetch(imagePath);
      const blob = await response.blob();
      
      // Create a File object from the blob
      const file = new File([blob], `sample_${imageNumber}.png`, { type: 'image/png' });
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file
      uploadFileAndNavigate(formData);
    } catch (error) {
      setUploading(false);
      console.error("Error handling sample image:", error);
    }
  }
  
  // Function to upload file and navigate to edit page
  async function uploadFileAndNavigate(formData: FormData) {
    try {
      setUploading(true);
      // Send the file to the server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      // Get the response data
      const data = await response.json();
      console.log("Upload successful:", data);
      
      // Navigate to the edit page
      router.push(`/upload/edit?image=${encodeURIComponent(data.filePath)}&sessionId=${encodeURIComponent(data.sessionId)}`);
    } catch (error) {
      setUploading(false);
      console.error("Error uploading file:", error);
    }
  }

  // Initialize GSAP animations
  useEffect(() => {
    // Create squiggly lines SVG in the background
    createSquigglyLines();
    
    // Animate the title without SplitText plugin
    const titleElement = titleRef.current;
    if (titleElement) {
      // Get the original text content
      const titleContent = titleElement.textContent || "";
      
      // Parse out the main text (everything before "AI")
      const mainText = titleContent.replace("AI", "");
      
      // Clear the original text
      titleElement.innerHTML = '';
      
      // Split and create character spans for the main text
      mainText.split('').forEach(char => {
        if (char !== ' ') {
          const charSpan = document.createElement('span');
          charSpan.className = 'char';
          charSpan.style.display = 'inline-block';
          charSpan.style.opacity = '0';
          charSpan.style.transform = 'translateY(40px) scale(0)';
          charSpan.textContent = char;
          titleElement.appendChild(charSpan);
        } else {
          // Add space
          const spaceSpan = document.createElement('span');
          spaceSpan.innerHTML = '&nbsp;';
          titleElement.appendChild(spaceSpan);
        }
      });
      
      // Add an extra space before AI
      const spaceSpan = document.createElement('span');
      spaceSpan.innerHTML = '&nbsp;';
      titleElement.appendChild(spaceSpan);
      
      // Add the AI part with color
      const aiSpan = document.createElement('span');
      aiSpan.className = 'char ai-text';
      aiSpan.style.display = 'inline-block';
      aiSpan.style.opacity = '0';
      aiSpan.style.transform = 'translateY(40px) scale(0)';
      // Initially set a fallback color in case gradient doesn't work
      aiSpan.style.color = '#8c66ff';
      aiSpan.style.fontWeight = 'bold';
      aiSpan.textContent = 'AI';
      
      // Set reference to aiTextRef for gradient animation
      aiSpan.id = 'ai-text-element';
      titleElement.appendChild(aiSpan);
      
      // Set the aiTextRef to the created span element
      aiTextRef.current = aiSpan;
      
      // Animate each character
      const chars = titleElement.querySelectorAll('.char');
      gsap.to(chars, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.03,
        ease: "back.out(1.7)"
      });
    }
    
    // Subtle pulse animation for upload button (continuous)
    if (uploadButtonRef.current) {
      gsap.to(uploadButtonRef.current, {
        scale: 1.03,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    // Clean up animations on component unmount
    return () => {
      gsap.killTweensOf(".char");
      if (uploadButtonRef.current) {
        gsap.killTweensOf(uploadButtonRef.current);
      }
    };
  }, []);

  // Function to create a confetti particle effect
  const createParticleEffect = (x: number, y: number, color: string) => {
    if (!svgContainerRef.current) return;
    
    const svg = svgContainerRef.current.querySelector('svg');
    if (!svg) return;
    
    // Create a group for particles
    const particleGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    particleGroup.classList.add("particle-group");
    
    // Create multiple particles
    const numParticles = 12 + Math.floor(Math.random() * 8); // 12-20 particles
    
    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      
      // Set initial position
      particle.setAttribute("cx", x.toString());
      particle.setAttribute("cy", y.toString());
      
      // Random small size
      const radius = 1 + Math.random() * 3;
      particle.setAttribute("r", radius.toString());
      
      // Random color variants
      const colors = ["#8c66ff", "#7b5ce0", "#6345c9", "#9d7eff", "#b08cff"];
      const colorIndex = Math.floor(Math.random() * colors.length);
      particle.setAttribute("fill", colors[colorIndex]);
      
      particleGroup.appendChild(particle);
      
      // Animate each particle outward
      const angle = Math.random() * Math.PI * 2; // Random angle in radians
      const distance = 20 + Math.random() * 40; // Random distance
      const duration = 0.5 + Math.random() * 0.8; // Random duration
      
      gsap.to(particle, {
        attr: {
          cx: x + Math.cos(angle) * distance,
          cy: y + Math.sin(angle) * distance,
          r: 0
        },
        opacity: 0,
        duration: duration,
        ease: "power2.out",
        onComplete: () => {
          particle.remove();
        }
      });
    }
    
    svg.appendChild(particleGroup);
    
    // Remove the particle group after all animations are done
    setTimeout(() => {
      if (particleGroup.parentNode) {
        particleGroup.remove();
      }
    }, 1500);
  };

  // Function to create a new bubble at a similar position to a popped one
  const createNewBubble = (group: SVGGElement, x: number, y: number, colors: string[]) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    
    // Position with slight randomness near the original position
    const newX = x + (Math.random() * 80 - 40);
    const newY = y + (Math.random() * 80 - 40);
    
    // Random size similar to original logic
    const radius = 5 + Math.random() * 20;
    
    circle.setAttribute("cx", newX.toString());
    circle.setAttribute("cy", newY.toString());
    circle.setAttribute("r", radius.toString());
    
    // Vary the colors
    const colorIndex = Math.floor(Math.random() * colors.length);
    
    // Decide between filled and outline circles
    const isFilled = Math.random() > 0.3;
    
    if (isFilled) {
      circle.setAttribute("fill", colors[colorIndex]);
      circle.setAttribute("fill-opacity", (0.1 + Math.random() * 0.3).toString());
      circle.setAttribute("stroke", "none");
    } else {
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", colors[colorIndex]);
      circle.setAttribute("stroke-width", (1 + Math.random() * 2).toString());
      circle.setAttribute("stroke-opacity", (0.3 + Math.random() * 0.4).toString());
    }
    
    // Add pop animation ability
    circle.style.pointerEvents = "auto";
    circle.style.cursor = "pointer";
    
    // Set initial opacity to 0 for fade-in effect on page load
    circle.setAttribute("opacity", "0");
    
    // Add the bubble pop event
    circle.addEventListener("click", function(e) {
      e.stopPropagation();
      
      // Get current position
      const currentX = parseFloat(this.getAttribute("cx") || "0");
      const currentY = parseFloat(this.getAttribute("cy") || "0");
      
      // Create a popping animation
      gsap.to(this, {
        scale: 1.5,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          // Create particle effect at bubble position
          createParticleEffect(currentX, currentY, colors[colorIndex]);
          
          // Remove this bubble
          this.remove();
          
          // Create a new replacement bubble
          createNewBubble(group, currentX, currentY, colors);
        }
      });
    });
    
    // Add to group
    group.appendChild(circle);
    
    // Different animation handling for initial bubbles vs replacement bubbles
    if (svgContainerRef.current && svgContainerRef.current.querySelector('svg')) {
      // For replacement bubbles, use scale and opacity animation
      gsap.fromTo(circle, 
        { attr: { "transform": "scale(0)" }, opacity: 0 }, 
        { attr: { "transform": "scale(1)" }, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    } else {
      // For initial load bubbles, use just fade-in without scale for more subtle effect
      // Start with normal scale
      circle.setAttribute("transform", "scale(1)");
    }
  };

  // New useEffect for the animated gradient
useEffect(() => {
  // First check if aiTextRef is populated
  if (!aiTextRef.current) {
    // If it's not populated, try to find it by ID
    const aiElement = document.getElementById('ai-text-element') as HTMLElement;
    if (aiElement) {
      aiTextRef.current = aiElement;
    } else {
      // If still not found, try to find the element with direct text matching
      const spans = document.querySelectorAll('b, span');
      for (const span of spans) {
        if (span.textContent === 'AI') {
          aiTextRef.current = span as HTMLElement;
          break;
        }
      }
    }
  }
  
  // Now check again if we have a reference
  if (!aiTextRef.current) return;
  
  // Add animation to the AI text
  const animateGradient = () => {
    const element = aiTextRef.current;
    if (!element) return;

    let hue = 0;
    let direction = 1; // 1 for forward, -1 for reverse
    const maxHue = 60; // Maximum hue variation
    
    const animate = () => {
      // Use a slower increment for smoother animation
      hue = hue + (0.2 * direction);
      
      // Reverse direction when reaching bounds
      if (hue >= maxHue) {
        direction = -1;
      } else if (hue <= 0) {
        direction = 1;
      }
      
      // Use purple shades - base is around 270 degrees in HSL
      const color1 = `hsl(${260 + hue/4}, 80%, 65%)`; // Lighter purple
      const color2 = `hsl(${280 + hue/4}, 90%, 45%)`; // Darker purple
      
      // Apply the gradient and make text transparent
      element.style.backgroundImage = `linear-gradient(45deg, ${color1}, ${color2})`;
      element.style.webkitBackgroundClip = 'text';
      element.style.backgroundClip = 'text';
      element.style.color = 'transparent';
      
      // Ensure the element is visible with proper CSS
      element.style.display = 'inline-block';
      element.style.opacity = '1';
      
      requestAnimationFrame(animate);
    };
    
    animate();
  };
  
  // Start the animation
  const animationId = requestAnimationFrame(animateGradient);
  
  // Clean up
  return () => {
    cancelAnimationFrame(animationId);
  };
}, []);

  // Function to create interactive bubble circles
  const createSquigglyLines = () => {
    if (!svgContainerRef.current) return;
    
    // Clear any existing SVGs
    svgContainerRef.current.innerHTML = '';
    
    // Create SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.zIndex = "1";
    
    // Create a single group for all bubbles
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.classList.add("bubble-group");
    
    // Define colors array to be reused for consistency
    const colors = ["#8c66ff", "#7b5ce0", "#6345c9", "#9d7eff", "#b08cff"];
    
    // Total number of bubbles - increased from 20 to 35
    const totalBubbles = 35;
    
    // Create bubbles with natural distribution
    for (let i = 0; i < totalBubbles; i++) {
      // Natural-looking position with higher probability near edges and corners
      let cx, cy;
      
      // Use a more organic placement algorithm to avoid looking like hotspots
      if (Math.random() < 0.7) {
        // Create bubbles near edges with variance (increased probability for edges)
        if (Math.random() < 0.5) {
          // Near vertical edges
          cx = Math.random() < 0.5 ? 
            Math.random() * window.innerWidth * 0.2 : // Left edge
            window.innerWidth * 0.8 + Math.random() * window.innerWidth * 0.2; // Right edge
          cy = Math.random() * window.innerHeight;
          
          // Avoid the center content area
          if (cy > window.innerHeight * 0.25 && cy < window.innerHeight * 0.75) {
            // Push further to the sides if in the middle vertical area
            cx = Math.random() < 0.5 ? 
              Math.random() * window.innerWidth * 0.15 : // Further left
              window.innerWidth * 0.85 + Math.random() * window.innerWidth * 0.15; // Further right
          }
        } else {
          // Near horizontal edges
          cx = Math.random() * window.innerWidth;
          cy = Math.random() < 0.5 ? 
            Math.random() * window.innerHeight * 0.2 : // Top edge
            window.innerHeight * 0.8 + Math.random() * window.innerHeight * 0.2; // Bottom edge
        }
      } else {
        // Some random bubbles throughout the page for natural feel
        // But avoid the central content area
        cx = Math.random() * window.innerWidth;
        cy = Math.random() * window.innerHeight;
        
        // If the bubble falls in the central content area, move it to a corner
        if (cx > window.innerWidth * 0.2 && cx < window.innerWidth * 0.8 &&
            cy > window.innerHeight * 0.2 && cy < window.innerHeight * 0.8) {
          // Move to one of the corners
          const corner = Math.floor(Math.random() * 4);
          switch (corner) {
            case 0: // Top-left
              cx = Math.random() * window.innerWidth * 0.2;
              cy = Math.random() * window.innerHeight * 0.2;
              break;
            case 1: // Top-right
              cx = window.innerWidth * 0.8 + Math.random() * window.innerWidth * 0.2;
              cy = Math.random() * window.innerHeight * 0.2;
              break;
            case 2: // Bottom-left
              cx = Math.random() * window.innerWidth * 0.2;
              cy = window.innerHeight * 0.8 + Math.random() * window.innerHeight * 0.2;
              break;
            case 3: // Bottom-right
              cx = window.innerWidth * 0.8 + Math.random() * window.innerWidth * 0.2;
              cy = window.innerHeight * 0.8 + Math.random() * window.innerHeight * 0.2;
              break;
          }
        }
      }
      
      // Add some artistic clustering - very subtle
      if (i > 0 && Math.random() < 0.3) {
        // Find a previously created bubble and place near it
        const circles = group.querySelectorAll("circle");
        if (circles.length > 0) {
          const randomBubble = circles[Math.floor(Math.random() * circles.length)];
          const randomBubbleX = parseFloat(randomBubble.getAttribute("cx") || "0");
          const randomBubbleY = parseFloat(randomBubble.getAttribute("cy") || "0");
          
          // Place near but not too close
          cx = randomBubbleX + (Math.random() * 160 - 80);
          cy = randomBubbleY + (Math.random() * 160 - 80);
        }
      }
      
      // Keep bubbles fully within the viewport
      cx = Math.max(20, Math.min(window.innerWidth - 20, cx));
      cy = Math.max(20, Math.min(window.innerHeight - 20, cy));
      
      createNewBubble(group, cx, cy, colors);
    }
    
    svg.appendChild(group);
    svgContainerRef.current.appendChild(svg);
    
    // Animate the initial bubbles with a fade-in effect
    const allInitialBubbles = svg.querySelectorAll('circle');
    gsap.to(allInitialBubbles, {
      opacity: (i, target) => {
        // Get the original opacity value from the element's attributes
        const isFilled = target.getAttribute("fill") !== "none";
        const baseOpacity = isFilled 
          ? parseFloat(target.getAttribute("fill-opacity") || "0.2")
          : parseFloat(target.getAttribute("stroke-opacity") || "0.3");
        return baseOpacity;
      },
      duration: 1.5,
      stagger: 0.03,
      ease: "power2.out"
    });
  };

  // Function to animate the squiggly lines
  const animateSquigglyLines = () => {
    // Animate each line individually for smoother performance
    document.querySelectorAll(".squiggly-line").forEach((line, index) => {
      // Animate path morphing
      gsap.to(line, {
        attr: { 
          d: () => {
            // Generate a slightly different path for each update
            const startX = Math.random() * window.innerWidth;
            const startY = Math.random() * window.innerHeight;
            let pathD = `M${startX},${startY} `;
            
            for (let j = 0; j < 10; j++) {
              const cpX1 = startX + (j * 40) + Math.random() * 40;
              const cpY1 = startY + Math.random() * 80 - 40;
              const cpX2 = startX + (j * 40) + 20 + Math.random() * 40;
              const cpY2 = startY + Math.random() * 80 - 40;
              const x = startX + (j * 40) + 40;
              const y = startY + Math.random() * 20 - 10;
              
              pathD += `C${cpX1},${cpY1} ${cpX2},${cpY2} ${x},${y} `;
            }
            
            return pathD;
          }
        },
        duration: 8, // Faster animation
        repeat: -1,
        repeatRefresh: true,
        ease: "none"
      });

      // Animate opacity
      gsap.to(line, {
        opacity: 0.15,
        duration: 4,
        repeat: -1,
        yoyo: true,
        delay: index * 0.2, // Staggered starts
        ease: "sine.inOut"
      });
      
      // Subtle movement
      gsap.to(line, {
        x: () => Math.random() * 100 - 50,
        y: () => Math.random() * 100 - 50,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.1
      });
    });
  };

  // Apply marker underline to the text
  useEffect(() => {
    if (instantlyFreeRef.current) {
      // Create a canvas element for the marker underlining
      const textElement = instantlyFreeRef.current;
      const textRect = textElement.getBoundingClientRect();
      
      // Create a temporary SVG element for the underline
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", textRect.width.toString());
      svg.setAttribute("height", "12"); // Height for the underline
      svg.style.position = "absolute";
      svg.style.left = "0";
      svg.style.bottom = "-5px"; // Position slightly below text
      svg.style.zIndex = "0";
      svg.style.pointerEvents = "none"; // Don't interfere with clicks
      
      // Create a path for the marker effect
      const path = document.createElementNS(svgNS, "path");
      
      // Create a straight horizontal line
      const pathD = `M 0,6 L ${textRect.width},6`;
      
      path.setAttribute("d", pathD);
      path.setAttribute("stroke", "#8c66ff");
      path.setAttribute("stroke-width", "6");
      path.setAttribute("stroke-linecap", "square"); // Square ends for a clean look
      path.setAttribute("opacity", "0.8"); // Slightly more translucent for natural feel
      path.setAttribute("fill", "none");
      
      svg.appendChild(path);
      instantlyFreeRef.current.appendChild(svg);
      
      // Animate the underline drawing
      const pathLength = path.getTotalLength();
      path.style.strokeDasharray = pathLength.toString();
      path.style.strokeDashoffset = pathLength.toString();
      
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 0.7, // Slightly slower for a more hand-drawn feel
        ease: "power2.out", // More natural easing
        delay: 0.2
      });
    }
  }, []);

  return (
    <div className="bg-gray-100 text-black min-h-screen relative overflow-hidden" ref={containerRef}>
      {/* Container for SVG squiggly lines */}
      <div className="absolute inset-0 w-full h-full" ref={svgContainerRef}></div>
      
      {/* Loading overlay */}
      {uploading && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#8c66ff] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium"></p>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col mt-12 lg:flex-row items-start relative z-10">
        {/* Left side - Text content */}
        <div className="w-full lg:w-1/2 mb-12 lg:mb-0 lg:pr-12" ref={leftSideRef}>
          {/* Video from first code that auto-restarts after 5 seconds */}
          <div className="rounded-2xl overflow-hidden">
            <video
              ref={videoRef}
              src="/images/home_image.mp4"
              width={1000}
              height={800}
              className="w-full h-auto object-cover"
              autoPlay
              muted
              loop={false}
              playsInline
            />
          </div>
          <h1 className="text-5xl lg:text-7xl font-md mb-6 mt-10 text-center overflow-hidden" ref={titleRef}>
            Fix Your Style With<b ref={aiTextRef} className="inline-block font-bold">AI</b>
          </h1>
          <div className="flex mb-8">
            <h2 className="text-2xl font-bold">
              Personalized Outfit Ideas,{' '}
              <span 
                className="px-3 py-1 rounded-md ml-1 relative" 
                ref={instantlyFreeRef}
                style={{ position: 'relative' }}
              >
                Instantly & Free
              </span>
            </h2>
          </div>
        </div>

        {/* Right side - Upload area and Sample Outfits */}
        <div className="w-full lg:w-1/2 space-y-6  ml-10">
          <div 
            className="bg-white p-8 rounded-4xl transition-all duration-300 w-full max-w-xl mx-auto h-115 shadow-lg
                       hover:shadow-[0_0_25px_5px_rgba(140,102,255,0.3)] hover:scale-[1.02]
                       border border-gray-200 hover:border-[#8c66ff]"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            ref={uploadBoxRef}
          >
            <div className="flex flex-col items-center justify-center h-full text-center py-12 pb-5">
              <button
                onClick={handleUploadClick}
                className="cursor-pointer text-white text-3xl font-semibold py-4 px-10 rounded-full mb-8 
                           hover:bg-[#7b5cf0] transition-colors transform hover:scale-105"
                ref={uploadButtonRef}
                style={{
                  background: "linear-gradient(45deg, #8c66ff, #6345c9)",
                  boxShadow: "0 4px 15px rgba(140, 102, 255, 0.3)"
                }}
              >
                Upload Photo
              </button>
              
              <p className="text-black text-2xl mb-1 font-semibold">
                or drop an image,
              </p>
              <p className="text-black">
                paste a <span className="text-[#8c66ff] underline hover:text-[#7b5cf0]">URL</span>
              </p>
              
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                ref={fileInputRef}
              />
              
              {selectedFile && (
                <div className="mt-8 p-3 bg-gray-200 rounded-lg mx-4">
                  <div className="flex items-center">
                    <div className="bg-[#8c66ff] p-2 rounded mr-3">
                      <FiUpload className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-600">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sample outfits section */}
          <div className="max-w-xl mx-auto mt-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="md:w-2/4 text-center">
                <p className="text-gray-700 text-lg font-semibold pr-13">
                  No image?
                </p>
                <p className="text-gray-700 text-lg font-semibold whitespace-nowrap">
                  Try one of these:
                </p>
              </div>
              <div className="md:w-4/4">
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((num) => (
                  <div 
                    key={num} 
                    className="cursor-pointer transition-opacity relative group"
                    onClick={() => handleSampleImageClick(num)}
                  >
                    <Image 
                      src={`/images/test_pic${num}.png`}
                      alt={`Sample outfit ${num}`}
                      width={100} 
                      height={100} 
                      className="rounded-xl object-cover w-20 h-20 border-2 border-[#8c66ff] shadow-md hover:shadow-[0_0_10px_rgba(140,102,255,0.5)] transition-shadow duration-300"
                    />
                    <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 rounded-xl transition-all duration-200 flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 font-bold text-xs">Use this</span>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>
            <div className="mt-5 text-xs text-gray-600">
              By uploading an image or URL you agree to our{' '}
              <Link href="/terms" className="text-[#8c66ff] underline">Terms of Service</Link>.
              To learn more about how our Wardrobe Assistant handles your personal data, check our{' '}
              <Link href="/privacy" className="text-[#8c66ff] underline">Privacy Policy</Link>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}