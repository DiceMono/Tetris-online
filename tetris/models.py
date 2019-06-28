from django.db import models

class Client(models.Model):
    room_name = models.CharField(max_length=30)
    channel_name = models.CharField(max_length=30)

    def __str__(self):
        return str(self.id) + self.channel_name