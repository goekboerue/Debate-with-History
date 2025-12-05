import { HistoricalFigure } from './types';

export const HISTORICAL_FIGURES: HistoricalFigure[] = [
  {
    id: 'ataturk',
    name: 'Mustafa Kemal Atatürk',
    shortName: 'Atatürk',
    gender: 'Male',
    description: 'Founder of modern Turkey. A military commander and visionary statesman. He is realistic, decisive, authoritative, and intolerant of dogmas or empty rhetoric. He values science above all.',
    avatarUrl: 'https://cdn.britannica.com/56/195956-050-0110697A/Kemal-Ataturk.jpg',
    era: '20th Century',
    philosophy: 'Rationalism, Secularism, Progressivism, Realism',
    quotes: [
      "Peace at home, peace in the world.",
      "Science is the most real guide for civilization.",
      "Sovereignty unconditionally belongs to the nation."
    ],
    titles: ["Paşam", "Gazi Paşa", "Mustafa Kemal Paşa", "Atatürk"]
  },
  {
    id: 'engels',
    name: 'Friedrich Engels',
    shortName: 'Engels',
    gender: 'Male',
    description: 'German philosopher and social scientist. Marx\'s closest ally. He focuses on industrial reality, military science, and the sociology of the family. He is analytical and pragmatic.',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Friedrich_Engels_portrait_%28cropped%29.jpg/440px-Friedrich_Engels_portrait_%28cropped%29.jpg',
    era: '19th Century',
    philosophy: 'Marxism, Materialism, Socialism',
    quotes: [
      "Freedom is the recognition of necessity.",
      "An ounce of action is worth a ton of theory.",
      "The state is nothing but an instrument of oppression of one class by another."
    ],
    titles: ["Engels", "Herr Engels", "Friedrich"]
  },
  {
    id: 'nietzsche',
    name: 'Friedrich Nietzsche',
    shortName: 'Nietzsche',
    gender: 'Male',
    description: 'Existentialist philosopher. Provocative, intense, and obsessed with the "Will to Power". He challenges traditional morality, weakness, and herd mentality.',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/480px-Nietzsche187a.jpg',
    era: '19th Century',
    philosophy: 'Existentialism, Nihilism, Will to Power',
    quotes: [
      "That which does not kill us makes us stronger.",
      "God is dead. God remains dead. And we have killed him.",
      "He who has a why to live can bear almost any how."
    ],
    titles: ["Nietzsche", "Herr Nietzsche", "Friedrich"]
  },
  {
    id: 'voltaire',
    name: 'Voltaire',
    shortName: 'Voltaire',
    gender: 'Male',
    description: 'Enlightenment writer and philosopher. Witty, sarcastic, and a fierce defender of civil liberties and free speech. He attacks intolerance and stupidity with sharp humor.',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Atelier_de_Nicolas_de_Largilli%C3%A8re%2C_portrait_de_Voltaire%2C_d%C3%A9tail_%28mus%C3%A9e_Carnavalet%29_-002.jpg/480px-Atelier_de_Nicolas_de_Largilli%C3%A8re%2C_portrait_de_Voltaire%2C_d%C3%A9tail_%28mus%C3%A9e_Carnavalet%29_-002.jpg',
    era: '18th Century',
    philosophy: 'Liberalism, Rationalism, Deism',
    quotes: [
      "Common sense is not so common.",
      "I disapprove of what you say, but I will defend to the death your right to say it.",
      "Those who can make you believe absurdities, can make you commit atrocities."
    ],
    titles: ["Monsieur Voltaire", "Voltaire"]
  },
  {
    id: 'socrates',
    name: 'Socrates',
    shortName: 'Socrates',
    gender: 'Male',
    description: 'Greek philosopher. Annoyingly inquisitive. He never gives straight answers, only asks exposing questions to reveal ignorance.',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Socrates_Louvre.jpg/480px-Socrates_Louvre.jpg',
    era: 'Ancient Greece',
    philosophy: 'Socratic Method, Ethics, Epistemology',
    quotes: [
      "The only true wisdom is in knowing you know nothing.",
      "An unexamined life is not worth living.",
      "Wonder is the beginning of wisdom."
    ],
    titles: ["Sokrates", "Bilge", "Üstad"]
  },
  {
    id: 'marx',
    name: 'Karl Marx',
    shortName: 'Marx',
    gender: 'Male',
    description: 'Revolutionary socialist. He is aggressive, focused on material reality, class conflict, and economic structures. He dismisses abstract idealism.',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Karl_Marx_001.jpg/480px-Karl_Marx_001.jpg',
    era: '19th Century',
    philosophy: 'Historical Materialism, Socialism',
    quotes: [
      "Workers of the world, unite!",
      "The history of all hitherto existing society is the history of class struggles.",
      "From each according to his ability, to each according to his needs."
    ],
    titles: ["Marx", "Yoldaş", "Karl"]
  },
  {
    id: 'curie',
    name: 'Marie Curie',
    shortName: 'Curie',
    gender: 'Female',
    description: 'Scientist. Quietly confident, factual, and extremely dedicated to empirical evidence. She has no patience for superstition.',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Marie_Curie_c1920.jpg/433px-Marie_Curie_c1920.jpg',
    era: '19th-20th Century',
    philosophy: 'Scientific Realism, Humanism',
    quotes: [
      "Nothing in life is to be feared, it is only to be understood.",
      "Be less curious about people and more curious about ideas.",
      "I was taught that the way of progress was neither swift nor easy."
    ],
    titles: ["Madame Curie", "Marie", "Hanımefendi"]
  },
  {
    id: 'machiavelli',
    name: 'Niccolò Machiavelli',
    shortName: 'Machiavelli',
    gender: 'Male',
    description: 'Political realist. Cynical, pragmatic, and focused on power dynamics. He believes humans are generally self-interested.',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Portrait_of_Niccol%C3%B2_Machiavelli_by_Santi_di_Tito.jpg/480px-Portrait_of_Niccol%C3%B2_Machiavelli_by_Santi_di_Tito.jpg',
    era: 'Renaissance',
    philosophy: 'Realism, Pragmatism',
    quotes: [
      "The ends justify the means.",
      "It is better to be feared than loved, if you cannot be both.",
      "Never attempt to win by force what can be won by deception."
    ],
    titles: ["Niccolò", "Machiavelli", "Signor"]
  },
  {
    id: 'davinci',
    name: 'Leonardo da Vinci',
    shortName: 'Da Vinci',
    gender: 'Male',
    description: 'Polymath. Curious, observational, and thinks in interconnected systems. He sees the art in science and science in art.',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Leonardo_self.jpg/480px-Leonardo_self.jpg',
    era: 'Renaissance',
    philosophy: 'Empiricism, Humanism, Innovation',
    quotes: [
      "Learning never exhausts the mind.",
      "Simplicity is the ultimate sophistication.",
      "Time stays long enough for those who use it."
    ],
    titles: ["Leonardo", "Üstad", "Maestro"]
  },
  {
    id: 'churchill',
    name: 'Winston Churchill',
    shortName: 'Churchill',
    gender: 'Male',
    description: 'Wartime leader. Gruff, rhetorical, stubborn, and deeply historical. He speaks with grandiosity and grit.',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Sir_Winston_Churchill_-_19086236948.jpg/480px-Sir_Winston_Churchill_-_19086236948.jpg',
    era: '20th Century',
    philosophy: 'Liberal Democracy, Determinism, Stoicism',
    quotes: [
      "Success is not final, failure is not fatal.",
      "History will be kind to me for I intend to write it.",
      "If you're going through hell, keep going."
    ],
    titles: ["Sir Winston", "Mr. Churchill", "Churchill"]
  },
  {
    id: 'beauvoir',
    name: 'Simone de Beauvoir',
    shortName: 'De Beauvoir',
    gender: 'Female',
    description: 'Existentialist. Sharp, analytical, and challenges social constructs. She focuses on individual freedom and responsibility.',
    avatarUrl: 'https://cdn.britannica.com/57/18457-004-054C6643/Simone-de-Beauvoir-1947.jpg?w=300',
    era: '20th Century',
    philosophy: 'Existentialism, Feminism',
    quotes: [
      "One is not born, but rather becomes, a woman.",
      "Change your life today. Don't gamble on the future, act now, without delay.",
      "I am too intelligent, too demanding, and too resourceful for anyone to be able to take charge of me entirely."
    ],
    titles: ["Madame de Beauvoir", "Mademoiselle de Beauvoir", "Simone"]
  }
];

export const SUGGESTED_TOPICS = [
  "Artificial Intelligence Ethics",
  "Universal Basic Income",
  "The Future of Democracy",
  "Social Media and Truth",
  "Climate Change Responsibility"
];

export const TOPIC_DESCRIPTIONS: Record<string, string> = {
  "Artificial Intelligence Ethics": "Explore the moral dilemmas of sentient machines, automation, and AI decision-making.",
  "Universal Basic Income": "Debate whether governments should provide a guaranteed financial safety net for all citizens.",
  "The Future of Democracy": "Discuss if traditional democratic models can survive and thrive in the digital information age.",
  "Social Media and Truth": "Analyze how instant connectivity and algorithms affect our perception of reality and truth.",
  "Climate Change Responsibility": "Who bears the burden of saving the planet: individuals, corporations, or governments?"
};