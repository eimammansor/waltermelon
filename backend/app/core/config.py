import redis
import os

REDIS_HOST = os.getenv("REDIS_HOST", "redis") # 'redis' is the service name in docker-compose
REDIS_PORT = 6379

# Initialize a global redis client
redis_client = redis.Redis(
    host=REDIS_HOST, 
    port=REDIS_PORT, 
    db=0, 
    decode_responses=True
)