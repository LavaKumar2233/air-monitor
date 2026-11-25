
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime, timezone


# =====================================
# AIR MONITOR - BACKEND
# =====================================

app = FastAPI(
    title="Air Monitor API",
    description="Backend API for the Air Quality and Temperature Monitoring System",
    version="1.0.0"
)


# =====================================
# CORS CONFIGURATION
# =====================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================
# SENSOR DATA MODEL
# =====================================

class SensorData(BaseModel):

    temperature: float = Field(
        ge=-40.2,
        le=117.2
    )

    gas: int = Field(
        ge=0,
        le=1023
    )


# =====================================
# INITIAL SENSOR DATA
# =====================================

latest_readings = {
    "temperature": 28.5,
    "gas": 512,
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "mode": "SIMULATION"
}


# =====================================
# ROOT ENDPOINT
# =====================================

@app.get("/")
def home():

    return {
        "message": "Air Monitor Backend is running!",
        "status": "online"
    }


# =====================================
# GET LATEST SENSOR READINGS
# =====================================

@app.get("/readings")
def get_readings():

    return {
        "success": True,
        "data": latest_readings
    }


# =====================================
# RECEIVE SENSOR READINGS
# =====================================

@app.post("/readings")
def receive_readings(data: SensorData):

    latest_readings["temperature"] = data.temperature
    latest_readings["gas"] = data.gas

    latest_readings["timestamp"] = (
        datetime.now(timezone.utc).isoformat()
    )

    latest_readings["mode"] = "RECEIVED"

    return {
        "success": True,
        "message": "Sensor readings received successfully!",
        "data": latest_readings
    }
