# Motte & [Bailey](https://github.com/adiwajshing/Baileys)
![watch-tower](https://3dwarehouse.sketchup.com/warehouse/v1.0/publiccontent/18e66fb7-a1e8-4877-aef6-66ee75cb4af9)

# WIP
THIS IS **NOT** FOR PRODUCTION. Probably using it is illegal about WhatsApp® term of use policy.

# REDIS DISPATCH EXAMPLE
- `publish zap:panoptic  "{\"type\":\"connect\",\"hardid\":\"t0f8mSuU\",\"shard\":\"0123456789012\"}"`
- `lpush zap:0123456789012:fifo:rawBread "{\"type\":\"textMessage_v001\",\"jid\":\"0123456789012@s.whatsapp.net\",\"msg\":\"hello to myself\"}"`
- `publish zap:panoptic  "{\"type\":\"disconnect\",\"hardid\":\"t0f8mSuU\",\"shard\":\"0123456789012\"}"`
- `publish zap:panoptic  "{\"type\":\"gracefuldown\",\"hardid\":\"t0f8mSuU\"}"`