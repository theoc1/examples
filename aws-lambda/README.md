#AWS Lambda examples

```$xslt
createUser.lamda.example.js
```
This lambda registers new user, generates password and sends it via email
then it calls loginGet lambda and returns its output.

Written with ES7 async/await pattern.


```$xslt
getProfessions.lambdda.example.js
```
This lambda gets list of professions from DB, sort them by weight
and returns a result.
    