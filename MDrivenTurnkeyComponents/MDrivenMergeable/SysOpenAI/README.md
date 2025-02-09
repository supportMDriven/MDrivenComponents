
# SysOpenAI Patttern
SysOpenAI model pattern is a model for integrating OpenAI functionality into your application.  
This model can be merged from TK Live View.  
Open AI has a wide variety of use cases from processing data, analyzing data, searching through data and automating other tasks in information systems or apps.

### SysOpenAISingleton

This class points to the instance on azure where ChatGPT is deployed.

### SysOpenAIChatSession

This class is for creating a new AI session and making requests to the AI instance.

### SysOpenAIMessage

This class contains interactions between the AI and User.

## Using SysOpenAI with OCL

```
-- new session to interact with AI
let sess=SysOpenAIChatSession.Create in
(
    let message1=SysOpenAIMessage.Create in
    (
        let message2=SysOpenAIMessage.Create in
        (
            -- instructions to AI
            message1.ChatRole:=#system;
            message1.Text:='<text string instruction on how AI should behave>';
            sess.SysOpenAIMessages.Add(message1);

            -- user input for issuing task
            message2.ChatRole:=#user;
            message2.Text:='<text string input from user>';
            sess.SysOpenAIMessages.Add(message2)

            sess.Generate;

            let response:=sess.SysOpenAIMessages->last in 
            (
                -- response from AI
                reponse.Text
            )
        )
    )
)
```


[Check Here](https://wiki.mdriven.net/Documentation:SysOpenAI_Package) for more details on SysOpenAI.