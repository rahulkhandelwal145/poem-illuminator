# Install via pip:
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
# pip install diffusers transformers accelerate fastapi uvicorn pillow

from io import BytesIO
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from diffusers import StableDiffusionPipeline, DDIMScheduler
import torch

device = "cuda" if torch.cuda.is_available() else "cpu"
dtype = torch.float16 if device == "cuda" else torch.float32

pipe = StableDiffusionPipeline.from_pretrained("CompVis/stable-diffusion-v1-4", torch_dtype=dtype)
# PNDM scheduler has a NoneType bug in newer diffusers — DDIM is stable
pipe.scheduler = DDIMScheduler.from_config(pipe.scheduler.config)
pipe.to(device)

app = FastAPI()

class PromptRequest(BaseModel):
    prompt: str

STEPS = 15 if device == "cpu" else 30

@app.post("/generate")
def generate(request: PromptRequest):
    image = pipe(request.prompt, num_inference_steps=STEPS).images[0]
    buf = BytesIO()
    image.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")
