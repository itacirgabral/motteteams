- [] https://api.gestorsistemas.com/api/auth/login
```JSON
{
    "email": "suporte@gestorsistemas.com",
    "password": "Cuiaba@700"
}
```

```
const doAuth = jwt => fetch('/', { 
    method: 'get', 
    headers: new Headers({
        'Authorization': `Basic ${jwt}`
    })
});