from qronos.db import create_db_and_tables
from qronos.app import app

if __name__ == "__main__":
    create_db_and_tables()
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)