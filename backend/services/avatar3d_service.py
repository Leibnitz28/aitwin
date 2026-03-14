import aiohttp
import base64
from typing import Dict, Any, Optional
from config import Config

class Avatar3DService:
    """Service to interact with 3D AI Studio API for Image-to-3D generation."""
    
    BASE_URL = "https://api.3daistudio.com/api"
    
    @classmethod
    async def create_3d_model(cls, image_bytes: bytes) -> Dict[str, Any]:
        """
        Submit an image to 3D AI Studio to start 3D generation.
        Returns a dict containing the task_id.
        """
        if not Config.has_3d_ai_studio():
            return {"error": "3D AI Studio API key not configured", "task_id": None}

        # Convert image bytes to base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')

        headers = {
            "Authorization": f"Bearer {Config.THREE_D_AI_STUDIO_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Following 3daistudio API structure from our research
        # Note: The exact endpoint and payload might vary slightly depending on their 
        # specific version, using standard hunyuan/trellis image-to-3d structure
        payload = {
            "image": f"data:image/jpeg;base64,{base64_image}",
            "model": "trellis" # Or "hunyuan"
        }

        try:
            async with aiohttp.ClientSession() as session:
                # The exact endpoint path might be /v1/generation or /api/generation
                async with session.post(f"{cls.BASE_URL}/generation", headers=headers, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        print(f"3D AI Studio Error ({response.status}): {error_text}")
                        return {"error": f"API returned {response.status}", "task_id": None}
                        
                    data = await response.json()
                    # Expecting {"task_id": "..."}
                    return {
                        "task_id": data.get("task_id"),
                        "status": "processing"
                    }
        except Exception as e:
            print(f"Error calling 3D AI Studio setup: {e}")
            return {"error": str(e), "task_id": None}

    @classmethod
    async def get_task_status(cls, task_id: str) -> Dict[str, Any]:
        """
        Poll the status of an ongoing 3D generation task.
        Returns { "status": "processing" | "succeeded" | "failed", "model_url": "..." }
        """
        if not Config.has_3d_ai_studio():
            return {"error": "API key missing", "status": "failed"}

        headers = {
            "Authorization": f"Bearer {Config.THREE_D_AI_STUDIO_API_KEY}"
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{cls.BASE_URL}/generation/{task_id}", headers=headers) as response:
                    if response.status != 200:
                        return {"error": "Failed to check status", "status": "failed"}
                        
                    data = await response.json()
                    
                    # Typical response: {"status": "succeeded", "result": {"model": "url_to.glb"}}
                    status = data.get("status", "processing")
                    model_url = None
                    
                    if status == "succeeded" and "result" in data:
                        # Find the GLB URL in the results
                        result = data["result"]
                        model_url = result.get("model") or result.get("glb")
                        
                    return {
                        "status": status,
                        "model_url": model_url,
                        "progress": data.get("progress", 0)
                    }
        except Exception as e:
            print(f"Error checking 3D task status: {e}")
            return {"error": str(e), "status": "failed"}
