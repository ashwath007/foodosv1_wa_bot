const axios = require('axios');





const { create, Client, ev } = require('@open-wa/wa-automate');


const launchConfig = {
    useChrome: true,
    autoRefresh: true,
    cacheEnabled: false,
    sessionId: 'hr',
    headless: true
};


const Rasa_port = "http://35.198.197.210/webhooks/rest/webhook"


const node_server = "https://foodosv1.herokuapp.com"
    // const node_server = "http://localhost:8000"


// ----------------------------- Node -  Rasa Message Transmission -------------------------------------
function start(client) {
    client.onMessage(async message => {
        console.log("Message type -> ", message.type)
        if (message.type === 'chat') {
            await client.simulateTyping(message.from, true)
            axios.post(Rasa_port, {
                    "sender": message.chatId,
                    "message": message.body
                })
                .then(async function(response) {
                    // console.log("response : ", response.data)
                    // console.log("response : ", response.data[0].text)
                    if (response.data[0].text === undefined)
                        await client.sendText(message.from, '👧🏻 Come on, Chat with me!!! 🤙🏻');
                    else
                        await client.simulateTyping(message.from, false)
                    await client.sendText(message.from, response.data[0].text);
                })
                .catch(function(error) {
                    console.log(error);
                });
        }


    });

    // -------------------------------------- User Location Set / Update ---------------------------------
    client.onMessage(message => {
        if (message.type === "location") {
            //Using destructuring
            const {
                // The text associated with the location
                loc,
                //Latitude
                lat,
                //Longitude
                lng
            } = message

            // post requies to 
            axios.post(`${node_server}/rasaapi/user/findUserData`, { chatId: message.chatId }).then(async(res) => {
                console.log(res)
                if (res.data.gotUser === null) {
                    await client.sendText(message.from, '👧🏻 Your profile is incomplete 🤙🏻, Wait');
                    // axios.post(Rasa_port, {
                    //         "sender": message.chatId,
                    //         "message": "profile"
                    //     }).then(async function(response) {
                    //         // console.log("response : ", response.data)
                    //         // console.log("response : ", response.data[0].text)
                    //         if (response.data[0].text === undefined)
                    //             await client.sendText(message.from, '👧🏻 Come on,  🤙🏻');
                    //         else
                    //             await client.sendText(message.from, response.data[0].text);
                    //     })
                    //     .catch(function(error) {
                    //         console.log(error);
                    //     });
                } else if (res.data.gotUser.profile_completed === false) {
                    // here save the user location and return
                    axios.post(`${node_server}/rasaapi/user/adduserlocation`, { chatId: message.chatId, lat: lat, lng: lng })
                        .then(async(res) => {

                            await client.sendText(message.from, `👧🏻 Your profile is all set ${res.data.gotUser.name}🤙🏻 Shall we order now ?`);
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                } else {
                    console.log("Here")
                    delivery_msg = "☺️ Ok, It will take ~18 min delivery 🏍️. Please wait ⌚ \n Do you need anything else ?"
                    await client.sendText(message.from, delivery_msg)
                }
            })

            .catch((err) => {
                console.log(err)
            })


            //         User.findOne({ wa_chatId: message.chatId }, async(err, gotUser) => {
            //             if (!gotUser) {
            //                 await client.sendText(message.from, '👧🏻 Your profile is incomplete 🤙🏻, Wait');
            //                 axios.post(Rasa_port, {
            //                         "sender": message.chatId,
            //                         "message": "profile"
            //                     }).then(async function(response) {
            //                         // console.log("response : ", response.data)
            //                         // console.log("response : ", response.data[0].text)
            //                         if (response.data[0].text === undefined)
            //                             await client.sendText(message.from, '👧🏻 Come on,  🤙🏻');
            //                         else
            //                             await client.sendText(message.from, response.data[0].text);
            //                     })
            //                     .catch(function(error) {
            //                         console.log(error);
            //                     });
            //             } else if (gotUser.profile_completed === false) {
            //                 console.log(message)
            //                 gotUser.location.coordinates.push(lat, lng);
            //                 gotUser.profile_completed = true;
            //                 gotUser.save(async(err, profileComplete) => {
            //                     if (err) {
            //                         await client.sendText(message.from, " Couldn't complete your profile ");
            //                     } else {
            //                         await client.sendText(message.from, `👧🏻 Your profile is all set ${gotUser.name}🤙🏻 Shall we order now ?`);
            //                         axios.post(Rasa_port, {
            //                             "sender": message.chatId,
            //                             "message": "I need biryani"
            //                         }).then(async(res) => {
            //                             console.log(res)
            //                             await client.sendText(message.from, response.data[0].text)
            //                         })
            //                     }
            //                 })
            //             } else {
            //                 console.log("Here")
            //                 delivery_msg = "☺️ Ok, It will take ~18 min delivery 🏍️. Please wait ⌚ \n Do you need anything else ?"
            //                 await client.sendText(message.from, delivery_msg)
            //             }
            //         })

            //         .then(async function(response) {
            //                 // console.log("response : ", response.data)
            //                 // console.log("response : ", response.data[0].text)
            //                 if (response.data[0].text === undefined)
            //                     await client.sendText(message.from, '👧🏻 Come on, Chat with me!!! 🤙🏻');
            //                 else
            //                     await client.sendText(message.from, response.data[0].text);
            //             })
            //             .catch(function(error) {
            //                 console.log(error);
            //             });
            //     }
            // })
            // ---------------------------------------------------------------------------------------------------

        }
        // --------------------------------------------------------------------------------------------------

    })
}
// WatsApp Automation Connection Here
create(launchConfig).then(start)