from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Client
from asyncio import sleep, wait, wait_for
import json

ENEMY_NUMBER = 1
class TetrisConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']

        await self.accept()
        await self.send(text_data=json.dumps({
            'type': message
        }))


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'tetris_message',
                'message': text_data_json
            }
        )

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

    async def tetris_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))

# class TetrisConsumer(AsyncWebsocketConsumer):
#     @database_sync_to_async
#     def count_client(self):
#         return Client.objects.filter(room_name=self.room_name).count()
#
#     @database_sync_to_async
#     def create_client(self):
#         return Client.objects.create(room_name=self.room_name, channel_name=self.channel_name)
#
#     @database_sync_to_async
#     def delete_client(self):
#         return Client.objects.get(channel_name=self.channel_name).delete()
#
#     @database_sync_to_async
#     def get_enemy_channel_name(self):
#         return Client.objects.filter(room_name=self.room_name).exclude(channel_name=self.channel_name)[0].channel_name
#
#     @database_sync_to_async
#     def is_enemy_exist(self):
#         return Client.objects.filter(room_name=self.room_name).exclude(channel_name=self.channel_name).exists()
#
#     async def connect(self):
#         self.room_name = self.scope['url_route']['kwargs']['room_name']
#         self.user = self.scope['user']
#         print(self.user.id)
#         a = 1
#         a+=1
#         print(a)
#         count = await self.count_client()
#         # if count > ENEMY_NUMBER:
#         a+=1
#         print(a)
#         self.client = await self.create_client()
#         await self.accept()
#         a+=1
#         print(a)
#         await sleep(10)
#
#         is_exist = False
#         while not is_exist:
#             is_exist = await self.is_enemy_exist()
#             print(is_exist)
#             await sleep(10)
#         a+=1
#         print(a)
#         self.enemy_channel = await self.get_enemy_channel_name()
#
#
#
#     async def disconnect(self, close_code):
#         print('hi')
#         await self.delete_client()
#         # await self.channel_layer.group_discard(
#         #     self.room_group_name,
#         #     self.channel_name
#         # )
#
#     async def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )
#
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'tetris_message',
#                 'message': text_data_json
#             }
#         )
#
#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )
#
#     async def tetris_message(self, event):
#         message = event['message']
#
#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             'message': message
#         }))

# class TetrisConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.room_name = self.scope['url_route']['kwargs']['room_name']
#         self.room_group_name = 'tetris_%s' % self.room_name
#
#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )
#
#         await self.accept()
#
#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )
#
#     async def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )
#
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'tetris_message',
#                 'message': text_data_json
#             }
#         )
#
#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )
#
#     async def tetris_message(self, event):
#         message = event['message']
#
#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             'message': message
#         }))