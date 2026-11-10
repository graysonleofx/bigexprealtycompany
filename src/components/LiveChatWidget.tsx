import { useEffect } from "react";

interface LiveChatWidgetProps {
  propertyId?: string;
  widgetId?: string;
}

/**
 * Tawk.to Live Chat Widget
 * 
 * To set up your own Tawk.to widget:
 * 1. Create a free account at https://www.tawk.to
 * 2. Get your Property ID and Widget ID from Dashboard > Administration > Channels > Chat Widget
 * 3. Replace the default IDs below with your own
 */
const LiveChatWidget = ({ 
  propertyId = "YOUR_TAWK_PROPERTY_ID", 
  widgetId = "YOUR_TAWK_WIDGET_ID" 
}: LiveChatWidgetProps) => {
  useEffect(() => {
    if (propertyId.startsWith("YOUR_") || widgetId.startsWith("YOUR_")) {
      return;
    }

    // Check if Tawk is already loaded
    if ((window as any).Tawk_API) {
      return;
    }

    // Create Tawk_API and Tawk_LoadStart
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();

    // Create and append the Tawk.to script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      // Remove the script
      const existingScript = document.querySelector(`script[src*="embed.tawk.to"]`);
      if (existingScript) {
        existingScript.remove();
      }
      // Clean up Tawk API
      delete (window as any).Tawk_API;
      delete (window as any).Tawk_LoadStart;
    };
  }, [propertyId, widgetId]);

  return null; // This component doesn't render anything visible
};

export default LiveChatWidget;
