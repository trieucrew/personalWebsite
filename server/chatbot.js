const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
const natural = require('natural');
const fs = require('fs');

const stemmer = natural.LancasterStemmer;
const tokenizer = new natural.TreebankWordTokenizer();
const intents = JSON.parse(fs.readFileSync('./server/intents.json', 'utf8'));

const ERROR_THRESHOLD = 0.25;
let model = null;
let data = {};
let context = {};

module.exports = {

  loadData : async function(){
    data = JSON.parse(fs.readFileSync('./server/tmp/training_model_1/modelData.json'));
    model = await tf.loadModel('file://./server/tmp/training_model_1/model.json');
  },

  cleanUpSentence : function(sentence){
    let sentenceWords = tokenizer.tokenize(sentence);
    sentenceWords = sentenceWords.map(w => stemmer.stem(w.toLowerCase()));
    return sentenceWords;
  },

  bow : function(sentence, words){
    let sentenceWords = module.exports.cleanUpSentence(sentence);
    let bag = new Array(data.words.length);
    bag.fill(0);

    for(s of sentenceWords){
      for(w of data.words){
        if(s == w){
          bag[data.words.indexOf(w)] = 1;
        }
      }
    }
    return bag;
  },

  classify : async function(sentence){
    if(model == null){
      await module.exports.loadData();
      console.log('data loaded');
    }
    let inputWords = tf.tensor2d(new Array(module.exports.bow(sentence, data.words)));
    let results = Array.from(model.predict(inputWords).flatten().dataSync());
    results = results.map(x => [results.indexOf(x), x])
      .sort((a,b) => b[1] - a[1])
      .filter(x => x[1] > ERROR_THRESHOLD);

    let returnList = [];
    for(r of results){
      returnList.push([data.classes[r[0]], r[1]]);
    }
    return returnList;
  },

  response : async function(sentence, userID = '123'){
    let results = await module.exports.classify(sentence);

    if(results.length != 0){
      while(results.length > 0){
        for(i of intents['intents']){
          if(i['tag'] == results[0][0]){
            return i['responses'][Math.floor(Math.random() * i['responses'].length)];
          }
        }
        results[0].pop()
      }
    }else{
      //default message here
    }
  }
}
