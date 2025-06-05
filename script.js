// Sidebar
document.addEventListener('DOMContentLoaded', function() {
  const toggleSidebar = document.getElementById("toggleSidebar");
  const sidebar = document.getElementById("sidebarMenu");
  let sidebarVisible = true; // Track sidebar state, starts visible

  if (toggleSidebar && sidebar) {
    toggleSidebar.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Toggle the sidebar visibility
      if (sidebarVisible) {
        sidebar.style.left = "-250px"; // Hide
        sidebarVisible = false;
      } else {
        sidebar.style.left = "0px"; // Show
        sidebarVisible = true;
      }
    });

    // Prevent sidebar from closing when clicking inside it
    sidebar.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }
});

// Highlight page sidebar
      
document.addEventListener('DOMContentLoaded', function() {
  const currentPagePath = window.location.pathname; // Get the path of the current page (e.g., "/user-profile.html")
  const sidebarLinks = document.querySelectorAll('#sidebarMenu a');

  sidebarLinks.forEach(link => {
    // FIRST, remove 'active' class from ALL links to ensure a clean slate.
    link.classList.remove('active');

    const originalHref = link.getAttribute('href'); // Get the literal href value (e.g., "#", "/dashboard.html")

    // If the link's href attribute starts with "#" (e.g., it's a "Logout" link or an on-page anchor),
    // we typically don't want to mark it as the "active page" in the navigation. So, we skip it.
    if (originalHref && originalHref.startsWith('#')) {
      return; // Go to the next link in the loop
    }


    let linkPath;
    try {
      // Create a URL object from the link's fully resolved href to easily get the pathname
      const linkUrl = new URL(link.href);
      linkPath = linkUrl.pathname;
    } catch (e) {
      // If link.href is somehow invalid, log it and skip.
      console.warn("Could not parse href for link:", link, e);
      return;
    }

    // Now, compare the link's path with the current page's path.
    // Also, handle common case where the root ("/") might be represented by "index.html" or a specific dashboard file in links.
    if (linkPath === currentPagePath) {
      link.classList.add('active');
    } else if (currentPagePath === '/' && (linkPath === '/index.html' || linkPath === '/dashboard.html' /* if dashboard.html is your root page */)) {
      // If current page is the root, and this link points to a common root file
      link.classList.add('active');
    } else if (linkPath === '/' && (currentPagePath === '/index.html' || currentPagePath === '/dashboard.html')) {
      // If current page is a common root file, and this link points to the root
      link.classList.add('active');
    }
  });
});
