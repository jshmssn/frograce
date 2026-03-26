// Generates a passage of approximately `wordCount` words from a pool of
// common English words. We avoid importing heavy NLP libs to keep bundle small.

const WORD_POOL = `
the quick brown fox jumps over the lazy dog a stitch in time saves nine
all that glitters is not gold every cloud has a silver lining actions speak
louder than words beauty is in the eye of the beholder better late than never
birds of a feather flock together curiosity killed the cat don't count your
chickens before they hatch don't judge a book by its cover every dog has its
day fortune favors the bold great minds think alike haste makes waste honesty
is the best policy ignorance is bliss it takes two to tango keep your friends
close and your enemies closer knowledge is power laughter is the best medicine
let sleeping dogs lie lightning never strikes the same place twice look before
you leap money is the root of all evil necessity is the mother of invention
no pain no gain once bitten twice shy practice makes perfect prevention is
better than cure quality over quantity Rome was not built in a day silence is
golden strike while the iron is hot the ball is in your court the best things
in life are free the early bird catches the worm the grass is always greener
the pen is mightier than the sword the proof is in the pudding there is no
place like home time flies when you are having fun two wrongs do not make
a right united we stand divided we fall variety is the spice of life when in
Rome do as the Romans do you cannot have your cake and eat it too absence
makes the heart grow fonder actions have consequences always look on the
bright side of life an apple a day keeps the doctor away appearances can be
deceiving as you sow so shall you reap ask not what your country can do for
you ask what you can do for your country bite the bullet burn the midnight oil
by the skin of your teeth cleanliness is next to godliness cut the mustard
dead men tell no tales do not bite the hand that feeds you do not put all your
eggs in one basket do unto others as you would have them do unto you easy come
easy go every action has an equal and opposite reaction expect the unexpected
failure is the stepping stone to success familiarity breeds contempt first
impressions are lasting impressions fool me once shame on you fool me twice
shame on me get a taste of your own medicine give credit where credit is due
go the extra mile good things come to those who wait half a loaf is better
than none he who hesitates is lost history repeats itself hope for the best
prepare for the worst if at first you do not succeed try try again if the
shoe fits wear it in the middle of every difficulty lies opportunity it is
always darkest before the dawn it is not over until it is over judge not that
you be not judged keep your chin up kill two birds with one stone know which
way the wind blows learn from yesterday live for today hope for tomorrow
life is what happens when you are busy making other plans look before you
leap but he who hesitates is lost make hay while the sun shines man cannot
live by bread alone many hands make light work mind over matter misery loves
company mistakes are proof that you are trying more haste less speed no guts
no glory nothing ventured nothing gained old habits die hard once in a blue
moon one man trash is another man treasure opportunity knocks only once out
of sight out of mind patience is a virtue people who live in glass houses
should not throw stones perseverance is the key to success power corrupts and
absolute power corrupts absolutely pride comes before a fall put your best
foot forward rising tides lift all boats seek and you shall find slow and
steady wins the race smooth seas do not make skillful sailors still waters
run deep success is not final failure is not fatal it is the courage to
continue that counts take the bull by the horns the bigger they are the
harder they fall the journey of a thousand miles begins with a single step
the more things change the more they stay the same the only way to do great
work is to love what you do the road to hell is paved with good intentions
the squeaky wheel gets the grease there are two sides to every story think
before you speak those who cannot remember the past are condemned to repeat it
through thick and thin time heals all wounds to err is human to forgive divine
too many cooks spoil the broth truth is stranger than fiction two heads are
better than one waste not want not what does not kill you makes you stronger
when life gives you lemons make lemonade where there is a will there is a way
wisdom comes with age words cut deeper than swords work smarter not harder
yesterday is history tomorrow is a mystery today is a gift that is why it
is called the present you miss one hundred percent of the shots you do not take
`.trim().split(/\s+/).filter(Boolean);

export function generateText(targetWordCount: number): string {
  const words: string[] = [];
  while (words.length < targetWordCount) {
    const w = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
    words.push(w);
  }

  // Group into sentences of 8–14 words
  const sentences: string[] = [];
  let i = 0;
  while (i < words.length) {
    const len = 8 + Math.floor(Math.random() * 7); // 8–14
    const chunk = words.slice(i, i + len);
    if (chunk.length === 0) break;
    const sentence =
      chunk[0].charAt(0).toUpperCase() + chunk[0].slice(1) +
      " " +
      chunk.slice(1).join(" ") +
      ".";
    sentences.push(sentence);
    i += len;
  }

  return sentences.join(" ");
}
