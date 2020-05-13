const puppeteer = require('puppeteer');
const email = process.env.FB_EMAIL;
const password = process.env.FB_PASSWORD;
const comments = require('./config').Comments;
const RELOAD_INTERVAL_MIN = 1000 * 60 * 2
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

(async () => {
  try {
    const browser = await puppeteer.launch({
      slowMo: 30,
      args: [
        '--window-size=1280,800',
        '--no-sandbox'
      ]
    });
    console.log("line  19")
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(1000000)
    await page.setViewport({ width: 1280, height: 800 })
    await page.goto('https://www.facebook.com')
    console.log("line 24")
    await page.waitForSelector('#email')
    await page.type('#email', email)
    await page.type('#pass', password)
    await page.click(`[type="submit"]`)
    console.log("line 29")
    await page.waitForNavigation()
    // await page.click(`div`)
    await page.waitForSelector(`[data-click="profile_icon"]`)
    while(true){
    console.log("line 34")
      await page.click(`[data-click="profile_icon"]`)
      if(page.url() === "https://www.facebook.com/profile.php?id=100004635300715"){
        break
      }
    }
    while(true){
        // await page.waitForNavigation();
        console.log("within while")
        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })
        await page.click(`div`)
        await page.evaluate(()=>{
            document.querySelector(".commentable_item").scrollIntoView({ behavior: 'smooth' })
        })
        await page.waitForSelector(".commentable_item")
        
        //finding the react element
        const isReacted = await page.evaluate(()=>{
          var reacts = ["Like", "Love", "Care", "Haha", "Wow", "Sad", "Angry"]
          var reactButton, isReacted
          let i = 0
          for(; i<=5; i++){ 
            if(reacts.includes(document.querySelector(".commentable_item").querySelectorAll('[role="button"]')[i].parentElement.innerText)){
              reactButton = document.querySelector(".commentable_item").querySelectorAll('[role="button"]')[i]
              isReacted = reactButton.getAttribute("aria-pressed")
              break
            }
          }
          return isReacted
        })
        console.log("isReacted", isReacted)

        //reacting
        if(isReacted === "false") {
            await page.evaluate(()=>{
              var reacts = ["Like", "Love", "Care", "Haha", "Wow", "Sad", "Angry"]
              var reactButton
              var commentButton
              let i = 0;
              for(; i<=5; i++){
                if(reacts.includes(document.querySelector(".commentable_item").querySelectorAll('[role="button"]')[i].parentElement.innerText)){
                  reactButton = document.querySelector(".commentable_item").querySelectorAll('[role="button"]')[i]
                  break
                }
                
              }
              reactButton.click()
              for(; i<=13; i++){
                if(document.querySelector(".commentable_item").querySelectorAll('[role="button"]')[i].parentElement.innerText === "Comment"){
                  commentButton = document.querySelector(".commentable_item").querySelectorAll('[role="button"]')[i]
                  break
                }
              }
              commentButton.click()
            })
            await page.waitForSelector('[aria-label="Write a comment..."]') //check for redundancy
            const comment = comments[Math.floor(Math.random() * comments.length)]
            await page.type('.commentable_item form div div div ~ div', comment)
            await page.keyboard.press(String.fromCharCode(13))
        } else {
            console.log("already reacted")
        }
        await sleep(RELOAD_INTERVAL_MIN)
        console.log("repeat")
    }
  } catch (error) {
    console.error(error);
  }
})();

// await page.type('[aria-label="Write a comment..."]', "nice")
    // await page.waitForSelector(
    //   `[aria-label="What's on your mind, Navendu?"]`
    // );
    // await page.click(`[aria-label="What's on your mind, Navendu?"]`);
    // type inside create post
    // let sentenceList = [
    //   `I will give just about anything if I could make you care, he said. Especially about me.`
    // //   `This apparent hurly-burly and disorder turn out, after all, to reproduce real life with its fantastic ways more accurately than the most carefully studied out drama of manners. Every man is in himself all humanity, and if he writes what occurs to him he succeeds better than if he copies, with the help of a magnifying glass, objects placed outside of him.`
    // ];

    // for (let j = 0; j < sentenceList.length; j++) {
    //   let sentence = sentenceList[j];
    //   for (let i = 0; i < sentence.length; i++) {
    //     await page.keyboard.press(sentence[i]);
    //     if (i === sentence.length - 1) {
    //       await page.waitFor(2000);
    //       await page.keyboard.down('Control');
    //       await page.keyboard.press(String.fromCharCode(13)); // character code for enter is 13
    //       await page.keyboard.up('Control');
    //       await page.waitFor(4000);

    //       console.log('done');
    //       await page.click(`[aria-label="What's on your mind, Navendu?"]`);
    //     }
    //   }
    // }