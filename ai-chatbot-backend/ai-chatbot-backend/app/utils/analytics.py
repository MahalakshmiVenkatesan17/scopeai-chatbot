import httpx
from user_agents import parse
from app.core.logging import logger

async def get_location_from_ip(ip: str) -> dict:
    """
    Get geographic location from IP address using ip-api.com (free for non-commercial use).
    """
    if not ip or ip in ("127.0.0.1", "localhost", "::1"):
        return {"country": "Local", "city": "Development", "region": "Internal"}

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(f"http://ip-api.com/json/{ip}?fields=status,message,country,city,regionName")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    return {
                        "country": data.get("country", "Unknown"),
                        "city": data.get("city", "Unknown"),
                        "region": data.get("regionName", "Unknown")
                    }
    except Exception as e:
        logger.error(f"Error resolving IP {ip}: {str(e)}")
    
    return {"country": "Unknown", "city": "Unknown", "region": "Unknown"}

def parse_user_agent(ua_string: str) -> dict:
    """
    Parse User-Agent string into human-readable browser, OS, and device info.
    """
    if not ua_string:
        return {"browser": "Unknown", "os": "Unknown", "device": "Unknown"}

    try:
        ua = parse(ua_string)
        
        # Get browser info
        browser = f"{ua.browser.family} {ua.browser.version_string}".strip()
        
        # Get OS info
        os = f"{ua.os.family} {ua.os.version_string}".strip()
        
        # Get device info
        device = ua.device.family
        if ua.is_mobile:
            device_type = "Mobile"
        elif ua.is_tablet:
            device_type = "Tablet"
        elif ua.is_pc:
            device_type = "PC"
        elif ua.is_bot:
            device_type = "Bot"
        else:
            device_type = "Unknown"
            
        return {
            "browser": browser or "Unknown",
            "os": os or "Unknown",
            "device": f"{device} ({device_type})" if device != "Other" else device_type
        }
    except Exception as e:
        logger.error(f"Error parsing User-Agent: {str(e)}")
        return {"browser": "Unknown", "os": "Unknown", "device": "Unknown"}
