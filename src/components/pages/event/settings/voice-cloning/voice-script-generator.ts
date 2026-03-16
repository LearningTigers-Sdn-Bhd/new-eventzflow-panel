/**
 * Neutral, High-Quality Reading Scripts for Voice Cloning
 * Selected for natural flow, grammatical correctness, and phonetic variety.
 * worth 30-60 seconds of speaking time.
 */

export type ScriptLanguage = "english" | "malay" | "chinese";

const SCRIPTS: Record<ScriptLanguage, string[]> = {
  english: [
    "The early morning sun cast long, golden shadows across the quiet valley. A gentle breeze carried the scent of pine and damp earth, whispering through the leaves of the ancient trees. As the world slowly awakened, the distant sound of a running stream provided a rhythmic backdrop to the peaceful landscape. It is in these moments of stillness that we find the clarity to reflect on our journey and appreciate the simple beauty that surrounds us every day.",
    "Walking along the familiar path, I noticed how the colors of the horizon shifted from deep indigo to a warm, vibrant orange. The air was crisp and refreshing, filling my lungs with every deliberate breath. I watched as a hawk circled high above, effortlessly riding the invisible currents of the sky. Sometimes, the most profound discoveries are not found in distant lands, but in the quiet observation of our own immediate world.",
    "The library was filled with the comforting smell of old paper and polished wood. Sunlight filtered through the tall, arched windows, illuminating tiny specks of dust dancing in the air. Each shelf held a thousand different worlds, waiting to be explored by anyone with the curiosity to open a cover. In the profound silence of that space, time seemed to slow down, allowing for a deep connection with the thoughts and ideas of those who came before us."
  ],
  malay: [
    "Cahaya matahari pagi menyinari seluruh lembah yang hening itu dengan sinaran keemasan. Bayu lembut yang bertiup tenang membawa keharuman tanah yang lembap, sambil berbisik di celah-celah dedaun pohon yang telah lama berdiri megah. Sedang alam mula bangkit daripada tidurnya, kedengaran bunyi aliran sungai dari kejauhan yang memberikan rentak irama kepada suasana yang damai ini. Dalam detik-detik sepi sebeginilah, kita sering menemui ketenangan untuk merenung kembali perjalanan hidup kita.",
    "Menelusuri laluan yang sudah biasa dilalui ini, saya memerhatikan bagaimana warna kaki langit berubah daripada biru pekat kepada jingga yang terang. Udara pagi yang segar terasa begitu nyaman, memenuhi setiap hela nafas dengan penuh kesegaran. Saya melihat seekor burung helang terbang tinggi, meluncur megah mengikut arus angin yang tidak kelihatan. Kadangkala, penemuan yang paling bermakna bukanlah berada di tempat yang jauh, sebaliknya berada dalam pemerhatian kita terhadap dunia di sekeliling.",
    "Suasana di dalam perpustakaan itu diselubungi dengan aroma kertas lama dan kayu yang digilap rapi. Cahaya matahari yang menembusi celah jendela besar menerangi ruang legar, menonjolkan keindahan susunan buku yang tersusun kemas. Setiap rak menyimpan seribu satu kisah dan ilmu yang menanti untuk diterokai oleh sesiapa sahaja yang mempunyai perasaan ingin tahu. Dalam keheningan ruang tersebut, masa seolah-olah terhenti, membolehkan kita mendalami pemikiran dan idea tokoh-tokoh terdahulu."
  ],
  chinese: [
    "清晨的阳光在静谧的山谷中投射出长长的金色影子。微风带着松树和湿润泥土的气息，在古老树木的叶缝间轻轻低语。当世界缓缓苏醒时，远处小溪的流水声为这片宁静的景色提供了节奏。正是在这些宁静的时刻，我们才能清晰地反思自己的旅程，并欣赏每天环绕在我们身边的简单之美。",
    "沿着熟悉的路径漫步，我注意到地平线的颜色从深紫色转变为温暖而充满活力的橘色。空气清新宜人，每一次深呼吸都让人感到心旷神怡。我看着一只老鹰在高空盘旋，毫不费力地顺着看不见的大气流翱翔。有时候，最深刻的发现并不在遥远的异国他乡，而是在对我们周围世界的静静观察中。",
    "图书馆里弥漫着陈年旧书和打磨过的木头的舒适气味。阳光透过高大的拱形窗户，照亮了在空气中舞动的微小尘埃。每一个书架都装载着千个不同的世界，等待着任何有好奇心的人去开启。在那片深邃的寂静中，时间似乎慢了下来，让我们能够与前人的思想和见解产生深刻的共鸣。"
  ]
};

export function generateVoiceScript(lang: ScriptLanguage = "english") {
  const options = SCRIPTS[lang];
  return options[Math.floor(Math.random() * options.length)];
}
