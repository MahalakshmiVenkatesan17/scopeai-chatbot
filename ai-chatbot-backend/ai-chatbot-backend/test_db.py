import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

async def main():
    engine = create_async_engine("mysql+aiomysql://root:@localhost:3306/ai_chatbot_saas")
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    async with async_session() as session:
        result = await session.execute(text("SELECT id, message_type, token_count, LENGTH(content), content FROM chat_messages ORDER BY id DESC LIMIT 5"))
        rows = result.mappings().all()
        for r in rows:
            print(f"ID: {r['id']}, Type: {r['message_type']}, Tokens: {r['token_count']}")
            content = r['content']
            print(f"Content Length: {len(content)}, Repr: {repr(content[:50])}")
            print("-" * 40)
            
if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
