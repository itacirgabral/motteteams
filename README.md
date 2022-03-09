# SETAPÃO DO ZAP

## alfabot
- `cloudflared tunnel --hostname alfabot.gestormessenger.team --url localhost:3978 --name alfanotebot -f`
- `cloudflared tunnel --hostname alfabot.gestormessenger.team --url localhost:3978 --name alfaorgabot -f`

## ssh redis
This will open a tunnel from the remote port 6379 (redis standard) to your local port 9999.
```
ssh -L 6380:localhost:6379 itacirgabral@gm.inf.br
```
## RSYNC
```
rsync -azP --exclude '*.log' ../gmapi itacirgabral@gm.inf.br:/home/itacirgabral/
```
