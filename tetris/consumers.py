from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from channels.exceptions import StopConsumer
from channels.utils import await_many_dispatch
from .models import Client
from asyncio import sleep, wait, wait_for
import json
import functools
from channels.layers import get_channel_layer

CHANNEL_PREFIX = 'specific'


class TetrisConsumer(AsyncWebsocketConsumer):
    async def __call__(self, receive, send):
        """
        Dispatches incoming messages to type-based handlers asynchronously.
        """
        # Initalize channel layer
        self.channel_layer = get_channel_layer(self.channel_layer_alias)
        if self.channel_layer is not None:
            user = self.scope['user']
            self.username = str(user)
            if user.is_anonymous:
                self.channel_name = await self.channel_layer.new_channel()
            else:
                self.channel_name = "%s.%s!%s" % (
                    CHANNEL_PREFIX,
                    self.channel_layer.client_prefix,
                    self.username,
                )
            self.channel_receive = functools.partial(
                self.channel_layer.receive, self.channel_name
            )
        # Store send function
        if self._sync:
            self.base_send = async_to_sync(send)
        else:
            self.base_send = send
        # Pass messages in from channel layer or client to dispatch method
        try:
            if self.channel_layer is not None:
                await await_many_dispatch(
                    [receive, self.channel_receive], self.dispatch
                )
            else:
                await await_many_dispatch([receive], self.dispatch)
        except StopConsumer:
            # Exit cleanly
            pass

    async def join_room(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'join_enemy',
                'channel': self.channel_name.split('!')[1],
                # TODO: handle username, channel name
                'message': '%s entered room' % self.scope['user'],
            }
        )
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        group_members = await self.channel_layer.get_group_members((self.room_group_name))
        print('member: ',group_members)
        group_members.pop(self.channel_name)
        enemies = [channel_name.split('!')[1] for channel_name in group_members.keys()]

        await self.send(text_data=json.dumps({
            'type': 'list_enemies',
            'enemies': enemies
        }))

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'tetris_%s' % self.room_name
        print('hi', self.scope)

        await self.accept()
        await self.join_room()
        await self.send(text_data=json.dumps({
            'type': "get_local_token"
        }))

    async def leave_room(self):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'leave_enemy',
                'channel': self.channel_name.split('!')[1],
                # TODO: handle username, channel name
                'message': '%s leaved room' % self.scope['user'],
            }
        )

    async def disconnect(self, close_code):
        await self.leave_room()

    async def is_enemy_exist(self):
        member_count = await self.channel_layer.count_group_members(self.room_group_name)
        if member_count > 1:
            return True
        return False

    async def send_start_game(self):
        if await self.is_enemy_exist():
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'start_game',
                }
            )
        else:
            await self.send(text_data=json.dumps({
                'type': 'alert',
                'message': 'can not start game'
            }))

    async def broadcast(self, text_data_json):
        text_data_json['channel'] = self.channel_name.split('!')[1]
        text_data_json['type'] = 'draw_enemy'
        score = int(text_data_json['score'])
        leaderboard = await self.channel_layer.update_score(self.room_group_name, self.channel_name, score)
        text_data_json['leaderboard'] = leaderboard
        await self.channel_layer.group_send_except_channel(self.room_group_name,
                                                           self.channel_name,
                                                           text_data_json)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        type = text_data_json['type']
        if type == 'send_start_game':
            await self.send_start_game()
        elif type == 'broadcast':
            await self.broadcast(text_data_json)

    async def _chat_event_handler(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': message
        }))

    async def join_enemy(self, event):
        event['type'] = 'join_enemy'
        await self.send(text_data=json.dumps(event))

    async def leave_enemy(self, event):
        event['type'] = 'leave_enemy'
        await self.send(text_data=json.dumps(event))

    async def start_game(self, event):
        await self.send(text_data=json.dumps({
            'type': 'start_game',
        }))

    async def draw_enemy(self, event):
        await self.send(text_data=json.dumps(event))
