
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { LuCamera, LuLightbulb, LuImage, LuWand } from "react-icons/lu";

export default function Workshop() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const classes = [
    {
      id: 1,
      icon: LuCamera,
      title: "Practical Field Workshop",
      titleHe: "סדנת צילום מעשית",
      price: language === 'he' ? "שעה - 250₪ | שעתיים - 450₪" : "1 hour - 250₪ | 2 hours - 450₪",
      topics: [
        language === 'he' ? "בחירת לוקיישן" : "Location selection",
        language === 'he' ? "צילום באור, צל ותאורה אחורית" : "Shooting in light, shade, and backlight",
        language === 'he' ? "עבודה עם עומק שדה רדוד/צר" : "Working with shallow/narrow depth of field",
        language === 'he' ? "שימוש בעדשות שונות" : "Using different lenses",
        language === 'he' ? "יצירת רגש ועניין בתמונות" : "Creating emotion and interest in photos",
        language === 'he' ? "עבודה עם רקע מוצק" : "Solid background work",
        language === 'he' ? "צילום תנועה" : "Motion photography",
        language === 'he' ? "שימוש ברפלקטורים" : "Using reflectors"
      ],
      bonus: language === 'he' ? "סט עשיר של שכבות-על הכולל עננים, עלי סתיו, אפקטי מים, פרפרים ועוד" : "Rich set of Overlays including clouds, autumn leaves, water effects, butterflies, and more"
    },
    {
      id: 2,
      icon: LuLightbulb,
      title: "Lightroom",
      titleHe: "לייטרום",
      duration: "2 hours",
      price: language === 'he' ? "שעה - 250₪ | שעתיים - 450₪" : "1 hour - 250₪ | 2 hours - 450₪",
      topics: [
        language === 'he' ? "ייבוא תמונות RAW" : "Importing RAW images",
        language === 'he' ? "למידת כלים חיוניים בלייטרום" : "Learning essential tools in Lightroom",
        language === 'he' ? "תהליך עריכת תמונה מלא" : "Complete photo editing process",
        language === 'he' ? "זיהוי נושא/שמיים (תכונה חדשה)" : "Subject/Sky detection (new feature)",
        language === 'he' ? "העתקת הגדרות עריכה בין תמונות" : "Copying edit settings between photos",
        language === 'he' ? "זרימת עבודה מובנית" : "Structured photo workflow"
      ]
    },
    {
      id: 3,
      icon: LuImage,
      title: "Basic Photoshop",
      titleHe: "פוטושופ בסיסי",
      duration: "2 hours",
      price: language === 'he' ? "שעה - 250₪ | שעתיים - 450₪" : "1 hour - 250₪ | 2 hours - 450₪",
      topics: [
        language === 'he' ? "העברת תמונות מלייטרום לפוטושופ" : "Transferring photos from Lightroom to Photoshop",
        language === 'he' ? "למידת כלים עיקריים בפוטושופ" : "Learning key tools in Photoshop",
        language === 'he' ? "עבודה עם שכבות" : "Working with layers",
        language === 'he' ? "קיצורי מקלדת חיוניים" : "Essential keyboard shortcuts",
        language === 'he' ? "הוספת אלמנטים (שכבת-על ומברשת)" : "Adding elements (Overlay and Brush)",
        language === 'he' ? "זרימת עבודה מובנית" : "Structured photo workflow"
      ]
    },
    {
      id: 4,
      icon: LuWand,
      title: "Advanced Photoshop",
      titleHe: "פוטושופ מתקדם",
      duration: "2 hours",
      price: language === 'he' ? "שעה - 250₪ | שעתיים - 450₪" : "1 hour - 250₪ | 2 hours - 450₪",
      topics: [
        language === 'he' ? "הוספה ועריכת עננים" : "Adding and editing clouds",
        language === 'he' ? "תיקוני גוף ופנים באמצעות Liquify" : "Body and face correction using Liquify",
        language === 'he' ? "טכניקות להסרת פרטי רקע" : "Background detail removal techniques",
        language === 'he' ? "ריטוש פנים מקצועי" : "Professional face retouching",
        language === 'he' ? "טכניקת אפקט מראה" : "Mirror effect technique",
        language === 'he' ? "טכניקות תאורה מתקדמות" : "Advanced lighting techniques",
        language === 'he' ? "טכניקת Dodge and Burn" : "Dodge and Burn technique",
        language === 'he' ? "עבודה עם גוונים חמים" : "Working with warm tones",
        language === 'he' ? "יצירת אפקטים של מים והשתקפויות" : "Creating water effects and reflections"
      ]
    }
  ];

  return (
    <div className="min-h-screen pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`container mx-auto px-4 py-16 ${language === 'he' ? 'rtl text-right !font-heebo' : 'ltr text-left'}`}
      >
        <h1 className="text-3xl font-bold mb-8 text-[#FF9500]">
          {language === 'he' ? 'סדנאות' : 'Workshop'}
        </h1>

        <div className="bg-card p-6 rounded-lg shadow-md mb-8 border border-white/30">
          <h2 className="text-xl font-semibold mb-4">{language === 'he' ? 'מידע כללי' : 'General Info'}</h2>
          <p className="text-muted-foreground mb-4">
            {language === 'he' 
              ? 'קורס צילום מקיף זה מציע הדרכה אישית אחד על אחד המכסה טכניקות מצלמה מעשיות ועד לעריכת תמונות מתקדמת בלייטרום ופוטושופ. כל שיעור מובנה כדי לבנות את המיומנויות שלך בהדרגה, עם תמיכה מתמשכת זמינה לאחר סיום השיעורים.'
              : 'This comprehensive photography course offers personalized one-on-one instruction covering hands-on camera techniques through to advanced photo editing in Lightroom and Photoshop. Each session is structured to build your skills progressively, with continued support available after classes conclude.'
            }
          </p>
          <ul className={`space-y-2 text-muted-foreground ${language === 'he' ? 'text-right' : ''}`} dir={language === 'he' ? 'rtl' : 'ltr'}>
            <li className={language === 'he' ? 'flex flex-row-reverse justify-end' : ''}>
              {language === 'he' ? '• כל השיעורים הינם אחד על אחד' : '• All classes are one-on-one'}
            </li>
            <li className={language === 'he' ? 'flex flex-row-reverse justify-end' : ''}>
              {language === 'he' ? '• ההסברים מלווים בדוגמאות והדמיה על תמונות' : '• Instructions include examples and demonstrations on photos'}
            </li>
            <li className={language === 'he' ? 'flex flex-row-reverse justify-end' : ''}>
              {language === 'he' ? '• זמין לשאלות גם לאחר השיעורים' : '• Available for questions even after classes'}
            </li>
            <li className={language === 'he' ? 'flex flex-row-reverse justify-end' : ''}>
              {language === 'he' ? '• מומלץ להגיע עם מחשב נייד ומחברת' : '• Recommended to bring a laptop and notebook'}
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {classes.map((classItem) => (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-white/30"
            >
              <div className={`flex items-center gap-3 mb-4 ${language === 'he' ? 'flex-row-reverse justify-start' : ''}`}>
                <classItem.icon className="w-8 h-8 text-[#FF9500]" />
                <div>
                  <h3 className="text-xl font-semibold">{language === 'he' ? classItem.titleHe : classItem.title}</h3>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-[#FF9500] font-semibold mb-1">{language === 'he' ? 'מחיר' : 'Price'}</div>
                <p className="text-muted-foreground">{classItem.price}</p>
              </div>

              <div>
                <div className="text-[#FF9500] font-semibold mb-2">{language === 'he' ? 'נושאים' : 'Topics'}</div>
                <ul className="space-y-1">
                  {classItem.topics.map((topic, index) => (
                    <li key={index} className="text-sm text-muted-foreground">• {topic}</li>
                  ))}
                </ul>
              </div>

              {classItem.bonus && (
                <div className="mt-4">
                  <div className="text-[#FF9500] font-semibold mb-1">{language === 'he' ? 'בונוס' : 'Bonus'}</div>
                  <p className="text-sm text-muted-foreground">{classItem.bonus}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
