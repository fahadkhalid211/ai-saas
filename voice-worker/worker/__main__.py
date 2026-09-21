import asyncio
import logging

from .config import Config
from .server import serve

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    asyncio.run(serve(Config.from_env()))
