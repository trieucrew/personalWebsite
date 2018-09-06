const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
const natural = require('natural');
const fs = require('fs');
require('./shuffle.js');

const stemmer = natural.LancasterStemmer;
const tokenizer = new natural.TreebankWordTokenizer();
let intents = JSON.parse(fs.readFileSync('intents.json', 'utf8'));

let words = [],
    classes = [],
    documents = [],
    ignoreWords = ['?'];

for(intent of intents['intents']){
  for(pattern of intent['patterns']){
    w = tokenizer.tokenize(pattern);
    words.push(...w);
    documents.push({words: w, tag: intent['tag']});

    if (!classes.includes(intent['tag'])){
      classes.push(intent['tag']);
    }
  }
}

words = words.filter(w => !ignoreWords.includes(w));
words = Array.from(new Set(words.map(w => stemmer.stem(w.toLowerCase())))).sort();
classes = Array.from(new Set(classes)).sort();

let training = [],
    output = [],
    outputEmpty = new Array(classes.length);
outputEmpty.fill(0);

for(doc of documents){
  let bag = [],
      patternWords = doc['words'];

  patternWords.map(w => stemmer.stem(w.toLowerCase()));
  for(w of words){
    bag.push(patternWords.includes(w) ? 1 : 0);
  }

  let outputRow = outputEmpty.slice();
  outputRow[classes.indexOf(doc['tag'])] = 1;
  training.push([bag, outputRow]);
}

training.shuffle();
let inputSize = training[0][0].length;
let outputSize = training[0][1].length;
let trainX = tf.tensor2d(training.map(x => x[0]));
let trainY = tf.tensor2d(training.map(y => y[1]));

const model = tf.sequential();
model.add(tf.layers.dense({units: 8, inputShape: [inputSize]}));
model.add(tf.layers.dense({units: 8}));
model.add(tf.layers.dense({units: 8}));
model.add(tf.layers.dense({units: outputSize, activation: 'softmax'}));

model.summary();
model.compile({loss: 'binaryCrossentropy', optimizer: 'adam', metrics: ['accuracy']});
model.fit(trainX, trainY, {epochs: 1000, batchSize: 8})
    .then(() => {
      model.save('file://./tmp/training_model_1').then(() => {
        console.log("created and saved");
      });
    });

let json = JSON.stringify({'words': words, 'classes': classes, 'trainX': trainX, 'trainY': trainY});
fs.writeFileSync('tmp/training_model_1/modelData.json', json);
