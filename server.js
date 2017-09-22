const express = require('express');
const mongoose= require('mongoose');
const body_parser = require('body-parser');
const morgan= require('morgan')
const redisClient=require('redis').createClient
const redis = redisClient(6379, 'localhost');
const Recent= require('./models/ImageSearch')
const request=require('request')
const app = express();



let port = process.env.PORT || 3000
app.use(morgan('dev'))
app.use(body_parser.json());


let url = 'mongodb://localhost:27017/image_search';
mongoose.connect(url, {
    useMongoClient: true
});


app.get('/api/imagesearch/:imageToSearch',(req,res)=> {
console.log(req.params.imageToSearch);

    let reqOptions={
        uri: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q='+req.params.imageToSearch+'&mkt=en-us',
        method: 'GET',
        headers: {
            "Ocp-Apim-Subscription-Key":"6b5d791a9338471aa1ae2b3dbbe9e883",
            "offset":req.query.offset
        }

    };


    request(reqOptions,function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
        let JSONdata=JSON.parse(body)

        if (error) {
            res.status(500).send({error:error})
        }
        else {
            new Recent({
                recent:req.params.imageToSearch
            })
                .save()
            res.status(200).send({
                data:JSONdata.value
            })
        }
    })
})

app.get('/api/recent',(req,res)=> {
    redis.get('recent',(redisError,redisSuccess)=> {
        if (redisError) {
            Recent.find({},(error,success)=> {
                if (error) {
                    res.status(500).send({error:error})
                }
                else {
                    if (success) {
                        res.status(200).send({
                            responseMessage:"OK",
                            response:success
                        })
                    }
                    else {

                        res.status(204).send({
                            responseMessage:"No content",
                            response:success
                        })
                    }
                }

            })

        }
        else if(redisSuccess)  {
            res.status(204).send({
                responseMessage:"No content",
                response:redisSuccess
            })
        }
        else {
            Recent.find({},(error,success)=> {
                if (error) {
                    res.status(500).send({error:error})
                }
                else {
                    if (success) {
                        res.status(200).send({
                            responseMessage:"OK",
                            response:success
                        })
                    }
                    else {
                        redis.set('recent',success)

                        res.status(204).send({
                            responseMessage:"No content",
                            response:success
                        })
                    }
                }

            })



        }
    })





})



app.listen(port,()=> {
    console.log("listening on port ",port)
})