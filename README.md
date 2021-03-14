<img src="https://netlicensing.io/img/netlicensing-stage-twitter.jpg">

# Labs64 NetLicensing / Auth0 Integration

[Labs64 NetLicensing](https://netlicensing.io) is a first-class solution in the Licensing as a Service (LaaS) sector. Based on open standards, it provides a cost effective, integrated and scalable platform for software vendors and developers who want to concentrate on their product’s core functionality instead of spending resources on developing an own license management software.

## Rule: Enrich user profile with NetLicensing validation

This rule validates user entitlements using NetLicensing license management services. User e-mail (if available) is being used as a customer identifier.

The validation result is immediately available in the `user_metadata` property and returns data in the ID token.

## Configuration

### Preconditions

- Valid and active NetLicensing vendor profile; register [here](https://ui.netlicensing.io/#/register)
- Working Auth0 configuration (incl. test application)

### Configure NetLicensing product

<img width="1143" alt="Screenshot 2021-03-14 at 21 45 01" src="https://user-images.githubusercontent.com/1361258/111084144-41cfae80-8511-11eb-844d-693d5d360927.png">

### Configure product module

<img width="1196" alt="Screenshot 2021-03-14 at 21 45 21" src="https://user-images.githubusercontent.com/1361258/111084147-42684500-8511-11eb-98ce-3564a30c6b18.png">

### Create Auth0 rule

Use [rule-netlicensing-validate.js](https://github.com/Labs64/NetLicensing-Auth0/blob/master/rule-netlicensing-validate.js) as rule content.

<img width="1450" alt="Screenshot 2021-03-14 at 21 45 53" src="https://user-images.githubusercontent.com/1361258/111084150-43997200-8511-11eb-8a1b-fcaeb685a6fb.png">

### Create NetLicensing API Key

Note: recommended API Key role `ROLE_APIKEY_LICENSEE`

<img width="1331" alt="Screenshot 2021-03-14 at 21 47 04" src="https://user-images.githubusercontent.com/1361258/111084154-44ca9f00-8511-11eb-93a5-9e6b426a7193.png">

### Required configuration

- `NETLICENSING_API_KEY` - NetLicensing API Key (step 4)
- `NETLICENSING_PRODUCT_NUMBER` - product number (step 1)
- `NETLICENSING_PRODUCT_MODULE_NUMBER` - product module number (step 2)

<img width="1109" alt="Screenshot 2021-03-14 at 21 46 07" src="https://user-images.githubusercontent.com/1361258/111084152-44ca9f00-8511-11eb-8c28-8050a3ab0040.png">

### Rule flow

Created and deployed rule will be executed after user login.

<img width="928" alt="Screenshot 2021-03-14 at 21 49 29" src="https://user-images.githubusercontent.com/1361258/111084155-45633580-8511-11eb-8612-44829df92513.png">

### Sample user info

Enriched user profile can be retrieved using Auth0 API; see [/userinfo](https://auth0.com/docs/api/authentication#user-profile) endpoint.

```json
{
    "email": "user@local.local",
    "https://netlicensing.io/auth0": {
        "id": null,
        "infos": {
            "info": []
        },
        "items": {
            "hasnext": null,
            "item": [
                {
                    "list": [],
                    "property": [
                        {
                            "name": "productModuleNumber",
                            "value": "MAUTH0"
                        },
                        {
                            "name": "valid",
                            "value": "true"
                        },
                        {
                            "name": "expires",
                            "value": "2021-03-21T20:52:45.867Z"
                        },
                        {
                            "name": "productModuleName",
                            "value": "Subscription module"
                        },
                        {
                            "name": "licensingModel",
                            "value": "Subscription"
                        }
                    ],
                    "type": "ProductModuleValidation"
                }
            ],
            "itemsnumber": null,
            "pagenumber": null,
            "totalitems": null,
            "totalpages": null
        },
        "signature": null,
        "ttl": "2021-03-14T21:02:45.867Z"
    },
    "name": "User",
    "nickname": "username",
    "picture": "https://avatars.githubusercontent.com/u/1361258?v=4",
    "sub": "github|1361258",
    "updated_at": "2021-03-14T20:52:45.984Z"
}
```

## Bugs and Feedback

For bugs, questions and discussions please use the [GitHub Issues](https://github.com/Labs64/NetLicensing-Auth0/issues).

## Links

- *What is Authentication-Authorization-Validation Framework* - https://netlicensing.io/blog/2020/09/24/authenticate-authorize-validate-framework/
