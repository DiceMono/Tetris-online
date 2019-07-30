from channels_redis.core import RedisChannelLayer
import time


class TetrisChannelLayer(RedisChannelLayer):
    async def group_except_channel_send(self, group, channel, message):
        """
        Sends a message to the entire group except specific channel.
        """
        assert self.valid_group_name(group), "Group name not valid"
        # Retrieve list of all channel names
        key = self._group_key(group)
        async with self.connection(self.consistent_hash(group)) as connection:
            # Discard old channels based on group_expiry
            await connection.zremrangebyscore(
                key, min=0, max=int(time.time()) - self.group_expiry
            )

            channel_names = [
                x.decode("utf8") for x in await connection.zrange(key, 0, -1)
            ]
            channel_names.remove(channel)

        connection_to_channel_keys, channel_keys_to_message, channel_keys_to_capacity = self._map_channel_keys_to_connection(
            channel_names, message
        )

        for connection_index, channel_redis_keys in connection_to_channel_keys.items():
            # Create a LUA script specific for this connection.
            # Make sure to use the message specific to this channel, it is
            # stored in channel_to_message dict and contains the
            # __asgi_channel__ key.

            group_send_lua = (
                    """
                        for i=1,#KEYS do
                            if redis.call('LLEN', KEYS[i]) < tonumber(ARGV[i + #KEYS]) then
                                redis.call('LPUSH', KEYS[i], ARGV[i])
                                redis.call('EXPIRE', KEYS[i], %d)
                            end
                        end
                        """
                    % self.expiry
            )

            # We need to filter the messages to keep those related to the connection
            args = [
                channel_keys_to_message[channel_key]
                for channel_key in channel_redis_keys
            ]

            # We need to send the capacity for each channel
            args += [
                channel_keys_to_capacity[channel_key]
                for channel_key in channel_redis_keys
            ]

            # channel_keys does not contain a single redis key more than once
            async with self.connection(connection_index) as connection:
                await connection.eval(
                    group_send_lua, keys=channel_redis_keys, args=args
                )

    async def get_group_members(self, group):
        assert self.valid_group_name(group), "Group name not valid"
        # Retrieve list of all channel names
        key = self._group_key(group)
        async with self.connection(self.consistent_hash(group)) as connection:
            # Discard old channels based on group_expiry
            await connection.zremrangebyscore(
                key, min=0, max=int(time.time()) - self.group_expiry
            )

            channel_names = [
                x.decode("utf8") for x in await connection.zrange(key, 0, -1)
            ]

            return channel_names

    # async def open_room(self):
    #     pass
    #
    # async def close_room(self):
    #     pass
    #
    # async def rank_members(self):
    #     pass
    #
    # async def is_host(self):
    #     pass
    #
