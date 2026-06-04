document.addEventListener("DOMContentLoaded", () => {
  // Set scroll restoration to manual to prevent browser scroll jumps from breaking ScrollTrigger pinning
  if (history.scrollRestoration) {
    history.scrollRestoration = "manual";
  }
  // Reset window scroll to top on reload
  window.scrollTo(0, 0);
  
  // Initialize Lucide Icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  /* ==========================================
     1. PRELOADER CURTAIN PROGRESS LOGIC
     ========================================== */
  const preloader = document.getElementById("preloader");
  const loaderProgress = document.getElementById("loaderProgress");
  
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 4; // Smooth random steps
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      
      // Curtain Slide Up reveal
      setTimeout(() => {
        if (preloader) {
          preloader.style.transform = "translateY(-100%)";
          preloader.style.opacity = "0";
          setTimeout(() => {
            preloader.style.display = "none";
            // Trigger Hero GSAP Entrance
            triggerHeroAnimations();
            
            // Force ScrollTrigger to refresh coordinates now that preloader is hidden and layout is stable
            if (typeof ScrollTrigger !== "undefined") {
              ScrollTrigger.refresh();
            }
          }, 800);
        }
      }, 300);
    }
    
    if (loaderProgress) {
      loaderProgress.textContent = `${progress}%`;
    }
  }, 50);

  /* ==========================================
     2. LIGHTWEIGHT CANVAS PARTICLES BACKGROUND
     ========================================== */
  const canvas = document.getElementById("particles-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particlesArray = [];
    
    // Set responsive dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle Object blueprint
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5; // Tiny elegant dots
        this.speedX = Math.random() * 0.2 - 0.1; // Very slow drift
        this.speedY = Math.random() * -0.3 - 0.1; // Float upwards
        this.alpha = Math.random() * 0.5 + 0.1;
        this.alphaSpeed = Math.random() * 0.005 + 0.002;
        this.growing = Math.random() > 0.5;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Loop back if off-screen
        if (this.y < 0) {
          this.y = canvas.height;
          this.x = Math.random() * canvas.width;
        }
        if (this.x < 0 || this.x > canvas.width) {
          this.x = Math.random() * canvas.width;
        }

        // Pulse opacity
        if (this.growing) {
          this.alpha += this.alphaSpeed;
          if (this.alpha >= 0.7) this.growing = false;
        } else {
          this.alpha -= this.alphaSpeed;
          if (this.alpha <= 0.1) this.growing = true;
        }
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        // Soft gold or white particles
        ctx.fillStyle = Math.random() > 0.6 ? "#D4AF37" : "#FFFFFF";
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize particle array
    const initParticles = () => {
      particlesArray = [];
      const numberOfParticles = Math.min(60, Math.floor(window.innerWidth / 20));
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    };
    initParticles();
    window.addEventListener("resize", initParticles);

    // Animation Loop
    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesArray.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateParticles);
    };
    animateParticles();
  }

  /* ==========================================
     3. CUSTOM CURSOR FOLLOWER
     ========================================== */
  const cursor = document.getElementById("customCursor");
  if (cursor) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });

    const attachHoverStates = () => {
      const interactiveElements = document.querySelectorAll(
        "a, button, input, select, textarea, [class*='group'], iframe, [class*='cursor-pointer']"
      );
      interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", () => cursor.classList.add("hovered"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("hovered"));
      });
    };
    attachHoverStates();
    
    // Periodically re-attach for dynamically rendering contents
    setInterval(attachHoverStates, 2000);
  }

  /* ==========================================
     4. STICKY HEADER & ACTIVE SCROLLBAR
     ========================================== */
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Custom smooth scroll navigation to anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ==========================================
     5. MOBILE NAVIGATION DRAWER
     ========================================== */
  const menuToggle = document.getElementById("menuToggle");
  const menuClose = document.getElementById("menuClose");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const drawerLinks = document.querySelectorAll(".drawer-link");

  const openDrawer = () => mobileDrawer?.classList.remove("translate-x-full");
  const closeDrawer = () => mobileDrawer?.classList.add("translate-x-full");

  if (menuToggle) menuToggle.addEventListener("click", openDrawer);
  if (menuClose) menuClose.addEventListener("click", closeDrawer);
  drawerLinks.forEach((link) => link.addEventListener("click", closeDrawer));

  /* ==========================================
     6. GSAP ENTRANCE & PARALLAX ENGINE
     ========================================== */
  function triggerHeroAnimations() {
    if (typeof gsap === "undefined") return;

    const tl = gsap.timeline();

    // 1. Ornament lines fade + slide in from sides
    tl.to("#heroOrnament", {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out"
    })

    // 2. Brand name slides up through text mask
    .to("#heroBrand", {
      y: "0%",
      duration: 1.1,
      ease: "power4.out"
    }, "-=0.4")

    // 3. Diamond divider fades in
    .to("#heroDivider", {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.3")

    // 4. Tagline slides up
    .to("#heroSub", {
      y: "0%",
      duration: 0.9,
      ease: "power3.out"
    }, "-=0.4")

    // 5. Main headline title words slide up
    .to("#heroTitle .text-mask-child", {
      y: "0%",
      duration: 1.1,
      stagger: 0.14,
      ease: "power4.out"
    }, "-=0.6")

    // 6. Body text fades up
    .to("#heroText", {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.5")

    // 7. CTA buttons fade up
    .to("#heroActions", {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.4");

    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      // Parallax Hero background
      gsap.to("#heroBg img", {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });

      // About text mask trigger
      gsap.to("#aboutTextWrapper .text-mask-child", {
        y: "0%",
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#about",
          start: "top 70%"
        }
      });

      // About Image card reveal
      gsap.from("#aboutImgWrapper", {
        opacity: 0,
        y: 60,
        scale: 0.95,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#about",
          start: "top 75%",
          toggleActions: "play none none none"
        }
      });

      // Showroom lookbook grids reveal
      gsap.from("#showroom .glass-card-fusion", {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#showroom",
          start: "top 70%",
          toggleActions: "play none none none"
        }
      });

      // Horizontal Scroll Parallax for Couture Reels (like Selora)
      const reelsTrack = document.getElementById("reels-track");
      const videoShowcase = document.getElementById("video-showcase");
      let horizontalTween;
      if (reelsTrack && videoShowcase) {
        horizontalTween = gsap.to(reelsTrack, {
          x: () => -(reelsTrack.scrollWidth - window.innerWidth + 120),
          ease: "none",
          scrollTrigger: {
            trigger: videoShowcase,
            start: "top top",
            end: () => `+=${reelsTrack.scrollWidth - window.innerWidth + 200}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true
          }
        });
      }

      // Initialize Video Hover/Autoplay logic with the horizontal tween reference
      initVideoAutoplay(horizontalTween);

      // Card Media Parallax Scrolling Effect
      if (horizontalTween && typeof ScrollTrigger !== "undefined") {
        const cardMediaElements = document.querySelectorAll(".video-card-link .video-poster, .video-card-link .video-element");
        cardMediaElements.forEach((el) => {
          gsap.fromTo(el,
            { xPercent: -6 },
            {
              xPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: el.closest(".video-card-link"),
                containerAnimation: horizontalTween,
                start: "left right",
                end: "right left",
                scrub: true
              }
            }
          );
        });
      }

      // Reviews cards reveal (clear props after completion to prevent Grid layout issues)
      gsap.from("#reviewsGrid .glass-card-fusion", {
        opacity: 0,
        y: 45,
        duration: 1.2,
        stagger: 0.15,
        ease: "power2.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: "#reviews",
          start: "top 75%"
        }
      });

      // Social feed columns reveal
      gsap.from("#feeds .grid > div", {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#feeds",
          start: "top 75%"
        }
      });

      // Contact us blocks reveal
      gsap.from("#contact .grid > div", {
        opacity: 0,
        y: 45,
        duration: 1.2,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#contact",
          start: "top 75%"
        }
      });

      // Force a coordinates refresh after all triggers are registered
      ScrollTrigger.refresh();
    }
  }

  /* ==========================================
     7. 3D TILT HOVER ENGINE
     ========================================== */
  const tiltCards = document.querySelectorAll(".glass-card-fusion");
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate within the element
      const y = e.clientY - rect.top;  // y coordinate within the element
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation bounds (-8deg to 8deg)
      const rotateX = ((centerY - y) / centerY) * 8;
      const rotateY = ((x - centerX) / centerX) * 8;
      
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    card.addEventListener("mouseleave", () => {
      // Smooth reset
      card.style.transform = "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
  });

  /* ==========================================
     8. CUSTOM SIMULATED FACEBOOK FEED ACTIONS
     ========================================== */
  const fbLikeBtn = document.getElementById("fbLikeBtn");
  const fbLikeCountText = document.getElementById("fbLikeCountText");
  const fbLikeBtnLabel = document.getElementById("fbLikeBtnLabel");
  const fbVideoPlayBtn = document.getElementById("fbVideoPlayBtn");
  const fbPlayBtnIcon = document.getElementById("fbPlayBtnIcon");
  const fbVideoPlayer = document.getElementById("fbVideoPlayer");
  const fbShareBtn = document.getElementById("fbShareBtn");
  const fbShareText = document.getElementById("fbShareText");

  let isFbLiked = false;
  let isFbPlaying = true; // Video autoplays

  // FB Like toggle
  if (fbLikeBtn) {
    fbLikeBtn.addEventListener("click", () => {
      isFbLiked = !isFbLiked;
      if (isFbLiked) {
        fbLikeCountText.textContent = "43 Likes";
        fbLikeBtn.classList.add("text-royalGold");
        fbLikeBtnLabel.textContent = "Liked";
        // Pop spring animation
        gsap.fromTo(fbLikeBtn, { scale: 0.9 }, { scale: 1.1, duration: 0.15, yoyo: true, repeat: 1 });
      } else {
        fbLikeCountText.textContent = "42 Likes";
        fbLikeBtn.classList.remove("text-royalGold");
        fbLikeBtnLabel.textContent = "Like";
      }
    });
  }

  // FB Native Video Play/Pause controls
  if (fbVideoPlayBtn && fbVideoPlayer) {
    fbVideoPlayBtn.addEventListener("click", () => {
      isFbPlaying = !isFbPlaying;
      if (isFbPlaying) {
        fbVideoPlayer.play();
        fbPlayBtnIcon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`; // Pause SVG
      } else {
        fbVideoPlayer.pause();
        fbPlayBtnIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`; // Play SVG
      }
    });
  }

  // FB Share to clipboard
  if (fbShareBtn) {
    fbShareBtn.addEventListener("click", () => {
      const shareUrl = "https://www.facebook.com/Couplescouture/";
      navigator.clipboard.writeText(shareUrl).then(() => {
        fbShareText.textContent = "Copied Link!";
        setTimeout(() => {
          fbShareText.textContent = "Share";
        }, 2000);
      });
    });
  }

  /* ==========================================
     8.5 COUTURE IN MOTION HOVER/AUTOPLAY LOGIC
     ========================================== */
  function initVideoAutoplay(horizontalTween) {
    const videoCards = document.querySelectorAll(".video-card-link");
    const isMobile = window.matchMedia("(hover: none)").matches;

    // Helper to play video cleanly
    const playVideo = (card, video) => {
      card.classList.add("video-playing");
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log("Video play prevented or delayed:", err);
        });
      }
    };

    // Helper to pause and reset video cleanly
    const pauseVideo = (card, video) => {
      card.classList.remove("video-playing");
      video.pause();
      // Reset to start of loop
      video.currentTime = 0;
    };

    // Play/Pause Autoplay Triggers
    if (isMobile && horizontalTween && typeof ScrollTrigger !== "undefined") {
      // Mobile in-view autoplay driven by horizontal track translation ScrollTrigger
      videoCards.forEach((card) => {
        const video = card.querySelector(".video-element");
        if (video) {
          ScrollTrigger.create({
            trigger: card,
            containerAnimation: horizontalTween,
            start: "left 75%", // Start playing when card center enters viewport
            end: "right 25%", // Pause playing when card center leaves viewport
            onEnter: () => playVideo(card, video),
            onEnterBack: () => playVideo(card, video),
            onLeave: () => pauseVideo(card, video),
            onLeaveBack: () => pauseVideo(card, video)
          });
        }
      });
    } else {
      // Desktop hover autoplay events
      videoCards.forEach((card) => {
        const video = card.querySelector(".video-element");
        if (video) {
          card.addEventListener("mouseenter", () => playVideo(card, video));
          card.addEventListener("mouseleave", () => pauseVideo(card, video));
        }
      });
    }
  }

  /* ==========================================
     9. IPHONE INSTAGRAM FEED SIMULATOR ENGINE
     ========================================== */
  const instaFollowBtn = document.getElementById("instaFollowBtn");
  const instaPostGrid = document.getElementById("instaPostGrid");
  const iphoneReelsPlayer = document.getElementById("iphoneReelsPlayer");
  const reelsCloseBtn = document.getElementById("reelsCloseBtn");
  const reelsVideoFrame = document.getElementById("reelsVideoFrame");

  let isInstaFollowing = false;

  // Follow Button toggle
  if (instaFollowBtn) {
    instaFollowBtn.addEventListener("click", () => {
      isInstaFollowing = !isInstaFollowing;
      if (isInstaFollowing) {
        instaFollowBtn.textContent = "Following";
        instaFollowBtn.classList.remove("bg-royalGold", "text-black");
        instaFollowBtn.classList.add("bg-studioGray-800", "text-white");
      } else {
        instaFollowBtn.textContent = "Follow";
        instaFollowBtn.classList.remove("bg-studioGray-800", "text-white");
        instaFollowBtn.classList.add("bg-royalGold", "text-black");
      }
    });
  }

  // Slide-in Reels Player on Grid item click (Now loads actual Instagram embed)
  if (instaPostGrid && iphoneReelsPlayer && reelsVideoFrame) {
    const posts = instaPostGrid.querySelectorAll("[data-instagram-id]");
    posts.forEach((post) => {
      post.addEventListener("click", () => {
        const instagramId = post.getAttribute("data-instagram-id");
        // Load the actual public Instagram embed URL in the iframe
        reelsVideoFrame.src = `https://www.instagram.com/reel/${instagramId}/embed/`;
        iphoneReelsPlayer.classList.add("active");
      });
    });
  }

  // Close Reels Player (Stops iframe playback)
  if (reelsCloseBtn && iphoneReelsPlayer && reelsVideoFrame) {
    reelsCloseBtn.addEventListener("click", () => {
      iphoneReelsPlayer.classList.remove("active");
      // Stop video immediately by resetting src
      setTimeout(() => {
        reelsVideoFrame.src = "";
      }, 300);
    });
  }

});

// Recalculate ScrollTrigger markers and layout shifts once all images are fully loaded
window.addEventListener("load", () => {
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.refresh();
  }
});
