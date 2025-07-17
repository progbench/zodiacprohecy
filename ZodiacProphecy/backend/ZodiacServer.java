
import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.nio.file.Files;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;

interface DataPersistence {
    void saveUser(User user);
    User getUserById(String id);
    List<User> getAllUsers();
    void clearAllData();
    boolean userExists(String id);
}

interface ProphecyGenerator {
    Prophecy generateProphecy(User user, Date date);
    String calculateZodiacSign(int month, int day);
}

interface Validator {
    boolean validate(Object data);
    List<String> getValidationErrors(Object data);
}

interface Exportable {
    String exportToCSV();
    String exportToJSON();
}

abstract class BaseHandler implements HttpHandler {
    protected static final String CORS_HEADERS = "Content-Type, Authorization, X-Requested-With";
    protected static final String ALLOWED_ORIGINS = "*";

    protected void setCORSHeaders(HttpExchange exchange) {
        Headers headers = exchange.getResponseHeaders();
        headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGINS);
        headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        headers.set("Access-Control-Allow-Headers", CORS_HEADERS);
        headers.set("Access-Control-Max-Age", "86400");
    }

    protected void sendJsonResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, response.length());
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response.getBytes());
        }
    }

    protected String extractParameter(String query, String paramName) {
        if (query == null) return null;
        String[] params = query.split("&");
        for (String param : params) {
            String[] keyValue = param.split("=");
            if (keyValue.length == 2 && keyValue[0].equals(paramName)) {
                return keyValue[1];
            }
        }
        return null;
    }

    protected boolean isOptionsRequest(HttpExchange exchange) {
        return "OPTIONS".equals(exchange.getRequestMethod());
    }

    protected void handleOptionsRequest(HttpExchange exchange) throws IOException {
        setCORSHeaders(exchange);
        exchange.sendResponseHeaders(200, -1);
    }
}

abstract class Transaction {
    protected boolean completed = false;
    protected boolean rollbackPerformed = false;

    public abstract void execute() throws Exception;
    public abstract void rollback() throws Exception;

    public final boolean commit() {
        try {
            execute();
            completed = true;
            return true;
        } catch (Exception e) {
            try {
                rollback();
                rollbackPerformed = true;
            } catch (Exception rollbackException) {
                System.err.println("Rollback failed: " + rollbackException.getMessage());
            }
            return false;
        }
    }

    public boolean isCompleted() { return completed; }
    public boolean isRolledBack() { return rollbackPerformed; }
}

class User implements Exportable {
    private String id;
    private String surname;
    private String firstName;
    private String middleInitial;
    private String suffix;
    private String gender;
    private int month;
    private int day;
    private int year;
    private Date timestamp;

    public User() {}

    public User(String surname, String firstName, String middleInitial, String suffix,
                String gender, int month, int day, int year) {
        this.surname = surname;
        this.firstName = firstName;
        this.middleInitial = middleInitial;
        this.suffix = suffix;
        this.gender = gender;
        this.month = month;
        this.day = day;
        this.year = year;
        this.timestamp = new Date();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getSurname() { return surname; }
    public void setSurname(String surname) { this.surname = surname; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getMiddleInitial() { return middleInitial; }
    public void setMiddleInitial(String middleInitial) { this.middleInitial = middleInitial; }
    public String getSuffix() { return suffix; }
    public void setSuffix(String suffix) { this.suffix = suffix; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }
    public int getDay() { return day; }
    public void setDay(int day) { this.day = day; }
    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }
    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }

    @Override
    public String exportToCSV() {
        return String.format("%s,%s,%s,%s,%s,%d,%d,%d,%s",
            surname, firstName, middleInitial != null ? middleInitial : "",
            suffix != null ? suffix : "", gender, month, day, year,
            new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(timestamp));
    }

    @Override
    public String exportToJSON() {
        return String.format(
            "{\"id\":\"%s\",\"surname\":\"%s\",\"firstName\":\"%s\",\"middleInitial\":\"%s\",\"suffix\":\"%s\",\"gender\":\"%s\",\"month\":%d,\"day\":%d,\"year\":%d,\"timestamp\":\"%s\"}",
            id != null ? id : "", surname, firstName,
            middleInitial != null ? middleInitial : "",
            suffix != null ? suffix : "", gender, month, day, year,
            new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(timestamp)
        );
    }
}

class Prophecy {
    private final String mainProphecy;
    @SuppressWarnings("FieldMayBeFinal")
    private String loveProphecy;
    @SuppressWarnings("FieldMayBeFinal")
    private String careerProphecy;
    private final String healthProphecy;
    private final String moneyProphecy;
    @SuppressWarnings("FieldMayBeFinal")
    private String zodiacSign;
    private final Date generatedDate;

    public Prophecy(String mainProphecy, String loveProphecy, String careerProphecy,
                   String healthProphecy, String moneyProphecy, String zodiacSign) {
        this.mainProphecy = mainProphecy;
        this.loveProphecy = loveProphecy;
        this.careerProphecy = careerProphecy;
        this.healthProphecy = healthProphecy;
        this.moneyProphecy = moneyProphecy;
        this.zodiacSign = zodiacSign;
        this.generatedDate = new Date();
    }

    public String getMainProphecy() { return mainProphecy; }
    public String getLoveProphecy() { return loveProphecy; }
    public String getCareerProphecy() { return careerProphecy; }
    public String getHealthProphecy() { return healthProphecy; }
    public String getMoneyProphecy() { return moneyProphecy; }
    public String getZodiacSign() { return zodiacSign; }
    public Date getGeneratedDate() { return generatedDate; }

    public String toJSON() {
        return String.format(
            "{\"zodiacSign\":\"%s\",\"prophecy\":{\"main\":\"%s\",\"love\":\"%s\",\"career\":\"%s\",\"health\":\"%s\",\"money\":\"%s\"}}",
            zodiacSign, mainProphecy, loveProphecy, careerProphecy, healthProphecy, moneyProphecy
        );
    }
}

class ConsultationRecord implements Exportable {
    private final User user;
    private final Date timestamp;
    private final String zodiacSign;
    private final String prophecyId;

    public ConsultationRecord(User user, ProphecyGenerator generator) {
        this.user = user;
        this.timestamp = new Date();
        this.zodiacSign = generator.calculateZodiacSign(user.getMonth(), user.getDay());
        this.prophecyId = generateProphecyId();
    }

    private String generateProphecyId() {
        return "PROPHECY_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
    }

    public User getUser() { return user; }
    public Date getTimestamp() { return timestamp; }
    public String getZodiacSign() { return zodiacSign; }
    public String getProphecyId() { return prophecyId; }

    @Override
    public String exportToCSV() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return String.format("%s,%s,%s,%s,%s,%d,%d,%d,%s,%s",
            user.getSurname(), user.getFirstName(),
            user.getMiddleInitial() != null ? user.getMiddleInitial() : "",
            user.getSuffix() != null ? user.getSuffix() : "",
            user.getGender(), user.getMonth(), user.getDay(), user.getYear(),
            zodiacSign, sdf.format(timestamp));
    }

    @Override
    public String exportToJSON() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return String.format(
            "{\"name\":\"%s, %s %s\",\"gender\":\"%s\",\"birthdate\":\"%d/%d/%d\",\"zodiacSign\":\"%s\",\"timestamp\":\"%s\",\"prophecyId\":\"%s\"}",
            user.getSurname(), user.getFirstName(),
            user.getMiddleInitial() != null ? user.getMiddleInitial() : "",
            user.getGender(), user.getMonth(), user.getDay(), user.getYear(),
            zodiacSign, sdf.format(timestamp), prophecyId
        );
    }
}

class InMemoryDataPersistence implements DataPersistence {
    private final Map<String, User> userDatabase = new ConcurrentHashMap<>();
    private final List<ConsultationRecord> consultations = Collections.synchronizedList(new ArrayList<>());

    @Override
    public void saveUser(User user) {
        if (user.getId() == null) {
            user.setId(generateUserId());
        }
        userDatabase.put(user.getId(), user);
    }

    @Override
    public User getUserById(String id) {
        return userDatabase.get(id);
    }

    @Override
    public List<User> getAllUsers() {
        return new ArrayList<>(userDatabase.values());
    }

    @Override
    public void clearAllData() {
        userDatabase.clear();
        consultations.clear();
    }

    @Override
    public boolean userExists(String id) {
        return userDatabase.containsKey(id);
    }

    public void addConsultation(ConsultationRecord record) {
        consultations.add(record);
    }

    public List<ConsultationRecord> getAllConsultations() {
        return new ArrayList<>(consultations);
    }

    private String generateUserId() {
        return "USER_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 1000);
    }
}

class ZodiacProphecyGenerator implements ProphecyGenerator {
    @SuppressWarnings("unused")
    private final Map<String, String[]> prophecyTemplates;

    public ZodiacProphecyGenerator() {
        prophecyTemplates = initializeProphecyTemplates();
    }

    @Override
    public Prophecy generateProphecy(User user, Date date) {
        String zodiacSign = calculateZodiacSign(user.getMonth(), user.getDay());
        int seed = generateSeed(user, date);

        // Generate completely dynamic main prophecy
        String mainProphecy = generateDynamicMainProphecy(zodiacSign, user, date, seed);

        return new Prophecy(
            mainProphecy,
            generateCategoryProphecy("love", zodiacSign, seed + 1),
            generateCategoryProphecy("career", zodiacSign, seed + 2),
            generateCategoryProphecy("health", zodiacSign, seed + 3),
            generateCategoryProphecy("money", zodiacSign, seed + 4),
            zodiacSign
        );
    }

    private String generateDynamicMainProphecy(String zodiacSign, User user, Date date, @SuppressWarnings("unused") int seed) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        String dateString = dateFormat.format(date);

        // Create unique seed based on birthday (not year) and current date
        String birthdaySeed = zodiacSign + user.getMonth() + user.getDay();
        String dailySeed = birthdaySeed + dateString;
        int dynamicSeed = Math.abs(dailySeed.hashCode());

        // AI-like dynamic text generation components
        String[] energyWords = {"cosmic", "celestial", "universal", "spiritual", "mystical", "divine", "magical", "ethereal", "astral", "quantum"};
        String[] actionWords = {"awakens", "transforms", "reveals", "channels", "amplifies", "manifests", "creates", "unlocks", "ignites", "activates"};
        String[] qualityWords = {"profound", "intense", "gentle", "powerful", "harmonious", "dynamic", "radiant", "vibrant", "luminous", "transcendent"};
        String[] timeWords = {"today", "now", "this moment", "currently", "at present", "right now", "this day", "immediately"};
        String[] connectionWords = {"through", "via", "by way of", "using", "with the help of", "guided by", "influenced by", "powered by"};

        // Generate unique structure each day
        String[] mainStructures = {
            energyWords[dynamicSeed % energyWords.length] + " energy " + actionWords[(dynamicSeed + 1) % actionWords.length] + " " + qualityWords[(dynamicSeed + 2) % qualityWords.length] + " opportunities " + timeWords[dynamicSeed % timeWords.length] + ". Your inner wisdom guides this transformation through " + zodiacSign + "'s influence.",
            timeWords[dynamicSeed % timeWords.length] + ", " + qualityWords[(dynamicSeed + 3) % qualityWords.length] + " " + energyWords[(dynamicSeed + 4) % energyWords.length] + " forces " + actionWords[(dynamicSeed + 5) % actionWords.length] + " new paths. " + zodiacSign + " energy flows " + connectionWords[dynamicSeed % connectionWords.length] + " your choices.",
            "A " + qualityWords[(dynamicSeed + 6) % qualityWords.length] + " shift " + actionWords[(dynamicSeed + 7) % actionWords.length] + " " + connectionWords[dynamicSeed % connectionWords.length] + " " + energyWords[(dynamicSeed + 8) % energyWords.length] + " alignment. Your " + zodiacSign + " nature enhances this cosmic dance.",
            energyWords[(dynamicSeed + 9) % energyWords.length] + " currents " + actionWords[(dynamicSeed + 10) % actionWords.length] + " " + qualityWords[(dynamicSeed + 11) % qualityWords.length] + " change in your life. " + zodiacSign + "'s wisdom illuminates the path forward."
        };

        return mainStructures[dynamicSeed % mainStructures.length].toUpperCase();
    }

    @Override
    public String calculateZodiacSign(int month, int day) {
        if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return "Capricorn";
        if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "Aquarius";
        if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Pisces";
        if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Aries";
        if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Taurus";
        if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Gemini";
        if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Cancer";
        if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leo";
        if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgo";
        if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra";
        if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Scorpio";
        if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagittarius";
        return "Capricorn";
    }

    private String generateCategoryProphecy(String category, String zodiacSign, int seed) {
        return generateDynamicProphecy(category, zodiacSign, seed, new Date());
    }

    private String generateDynamicProphecy(String category, String zodiacSign, int seed, Date date) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        String dateString = dateFormat.format(date);

        // Generate basic colors and stones
        String[] basicColors = {"Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Orange", "Black", "White", "Brown"};
        String[] stones = {"Amethyst", "Ruby", "Emerald", "Sapphire", "Diamond", "Opal", "Garnet", "Turquoise", "Jade", "Pearl", "Topaz", "Quartz"};
        String[] numbers = {"3", "7", "9", "11", "13", "17", "21", "23", "27", "31", "33", "37", "41", "44", "47", "51", "55", "63", "69", "77", "81", "88", "93", "99"};
        String[] initials = {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"};

        // Create unique daily seed
        String uniqueSeed = zodiacSign + category + dateString + seed;
        int dynamicSeed = Math.abs(uniqueSeed.hashCode());

        String luckyColor = basicColors[dynamicSeed % basicColors.length];
        String luckyStone = stones[(dynamicSeed + 1) % stones.length];
        String luckyNumber = numbers[(dynamicSeed + 2) % numbers.length];
        String significantInitial = initials[(dynamicSeed + 3) % initials.length];

        // AI-like dynamic text generation
        String emoji = getCategoryEmoji(category);
        String categoryText = generateCategorySpecificText(category, dynamicSeed, luckyColor, luckyStone, luckyNumber, significantInitial);

        return emoji + " " + categoryText.toUpperCase();
    }

    

    private String generateCategorySpecificText(String category, int seed, String color, String stone, String number, String initial) {
        String[] structures = {
            "Your " + getCategorySubject(category, seed) + " " + getCategoryAction(category, seed + 1) + " through " + color.toLowerCase() + " energy. The " + stone + " stone amplifies " + getCategoryOutcome(category, seed + 2) + " today.",
            color + " surroundings attract " + getCategorySubject(category, seed + 3) + " that " + getCategoryAction(category, seed + 4) + ". Look for connections with letter " + initial + " for " + getCategoryOutcome(category, seed + 5) + ".",
            "The number " + number + " guides " + getCategorySubject(category, seed + 6) + " toward " + getCategoryOutcome(category, seed + 7) + ". Your " + stone + " brings clarity to " + getCategoryAction(category, seed + 8) + " opportunities.",
            getCategorySubject(category, seed + 9) + " " + getCategoryAction(category, seed + 10) + " when you embrace " + color.toLowerCase() + " choices. " + stone + " energy supports " + getCategoryOutcome(category, seed + 11) + " in unexpected ways."
        };

        return structures[seed % structures.length].toUpperCase();
    }

    private String getCategorySubject(String category, int seed) {
        String[][] subjects = {
            {"romance", "connection", "attraction", "partnership", "intimacy", "affection", "emotion", "passion"}, // love
            {"opportunity", "success", "advancement", "recognition", "growth", "leadership", "innovation", "achievement"}, // career
            {"vitality", "wellness", "energy", "balance", "strength", "healing", "renewal", "harmony"}, // health
            {"prosperity", "abundance", "wealth", "income", "investment", "savings", "financial growth", "resources"} // money
        };
        int categoryIndex = getCategoryIndex(category);
        return subjects[categoryIndex][seed % subjects[categoryIndex].length];
    }

    private String getCategoryAction(String category, int seed) {
        String[][] actions = {
            {"blossoms", "deepens", "emerges", "strengthens", "flourishes", "awakens", "transforms", "develops"}, // love
            {"accelerates", "expands", "manifests", "develops", "progresses", "advances", "succeeds", "thrives"}, // career
            {"improves", "strengthens", "restores", "energizes", "balances", "heals", "revitalizes", "harmonizes"}, // health
            {"increases", "multiplies", "grows", "accumulates", "expands", "develops", "prospers", "flourishes"} // money
        };
        int categoryIndex = getCategoryIndex(category);
        return actions[categoryIndex][seed % actions[categoryIndex].length];
    }

    private String getCategoryOutcome(String category, int seed) {
        String[][] outcomes = {
            {"meaningful bonds", "lasting joy", "deep understanding", "emotional growth", "romantic fulfillment", "heart connections", "soul harmony", "true companionship"}, // love
            {"professional growth", "career breakthroughs", "new opportunities", "skill development", "leadership roles", "financial rewards", "recognition", "success"}, // career
            {"physical wellness", "mental clarity", "emotional balance", "renewed energy", "inner strength", "life vitality", "healing progress", "overall health"}, // health
            {"financial stability", "wealth creation", "investment success", "income growth", "prosperity gains", "security building", "abundance flow", "money success"} // money
        };
        int categoryIndex = getCategoryIndex(category);
        return outcomes[categoryIndex][seed % outcomes[categoryIndex].length];
    }

    private int getCategoryIndex(String category) {
        return switch (category.toLowerCase()) {
            case "love" -> 0;
            case "career" -> 1;
            case "health" -> 2;
            case "money" -> 3;
            default -> 0;
        };
    }

    @SuppressWarnings("unused")
    private String[] getSubjects(String category) {
        return switch (category.toLowerCase()) {
            case "love" -> new String[]{"Romance", "Passion", "Connection", "Attraction", "Intimacy", "Commitment", "Understanding", "Chemistry"};
            case "career" -> new String[]{"Opportunity", "Recognition", "Growth", "Success", "Innovation", "Leadership", "Collaboration", "Achievement"};
            case "health" -> new String[]{"Vitality", "Energy", "Wellness", "Balance", "Healing", "Strength", "Renewal", "Harmony"};
            case "money" -> new String[]{"Prosperity", "Investment", "Income", "Savings", "Opportunity", "Growth", "Security", "Abundance"};
            default -> new String[]{"Fortune", "Energy", "Growth", "Change", "Opportunity", "Success", "Balance", "Progress"};
        };
    }



    private String getCategoryEmoji(String category) {
        return switch (category.toLowerCase()) {
            case "love" -> "💕";
            case "career" -> "🚀";
            case "health" -> "💪";
            case "money" -> "💰";
            default -> "✨";
        };
    }

    @SuppressWarnings("unused")
    private String getDaySpecificContext(String category, int dayCode) {
        String[][] contexts = {
            // Love contexts
            {"Someone special notices your unique qualities.", "Romantic timing aligns perfectly with your desires.", "Heart-to-heart conversations create lasting bonds.", "Love arrives through unexpected circumstances.", "Emotional walls dissolve naturally."},
            // Career contexts  
            {"Your expertise solves complex workplace challenges.", "Professional networks expand in meaningful ways.", "Creative approaches outperform traditional methods.", "Leadership opportunities recognize your potential.", "Collaborative efforts yield impressive results."},
            // Health contexts
            {"Mind-body connection strengthens through awareness.", "Natural healing accelerates your recovery process.", "Energy levels increase through positive lifestyle choices.", "Physical activity brings mental clarity.", "Nutritional awareness improves overall wellness."},
            // Money contexts
            {"Smart financial decisions create long-term stability.", "Investment opportunities align with your values.", "Resourcefulness turns challenges into profitable solutions.", "Multiple income streams develop naturally.", "Financial partnerships prove mutually beneficial."}
        };

        int categoryIndex = switch (category.toLowerCase()) {
            case "love" -> 0;
            case "career" -> 1; 
            case "health" -> 2;
            case "money" -> 3;
            default -> 0;
        };

        return contexts[categoryIndex][dayCode % contexts[categoryIndex].length];
    }

    @SuppressWarnings("unused")
    private String[] getDynamicModifiers(String category, int seed) {
        Map<String, String[]> modifiers = new HashMap<>();

        modifiers.put("love", new String[]{
            "A surprise connection may emerge through unexpected circumstances.",
            "Pay attention to subtle signs and synchronicities in relationships.",
            "Someone from your past may reappear with important messages.",
            "New romantic energy enters through creative or spiritual activities.",
            "Trust your heart's wisdom over logical relationship analysis.",
            "Social gatherings bring meaningful romantic opportunities.",
            "Digital communication holds special significance today.",
            "Family connections influence your romantic choices positively."
        });

        modifiers.put("career", new String[]{
            "Hidden opportunities reveal themselves through casual conversations.",
            "Your unique perspective solves complex workplace challenges.",
            "Collaboration with distant colleagues brings breakthrough moments.",
            "Industry changes create new pathways for advancement.",
            "Your expertise attracts recognition from unexpected sources.",
            "Creative solutions outperform traditional approaches today.",
            "Professional networks expand through mutual interests.",
            "Leadership skills emerge naturally in team situations."
        });

        modifiers.put("health", new String[]{
            "Mind-body connection strengthens through mindful practices.",
            "Environmental changes support your wellness journey.",
            "Energy levels fluctuate - honor your body's natural rhythms.",
            "Healing happens through joyful movement and laughter.",
            "Nutrition awareness leads to beneficial dietary adjustments.",
            "Sleep patterns reveal important health information.",
            "Social connections boost mental and emotional wellbeing.",
            "Alternative healing methods show promising results."
        });

        modifiers.put("money", new String[]{
            "Unexpected income sources appear through personal skills.",
            "Wise spending decisions create long-term financial stability.",
            "Investment opportunities arise through professional connections.",
            "Resourcefulness turns limitations into creative solutions.",
            "Value-based purchases align with your authentic priorities.",
            "Financial partnerships require careful consideration and trust.",
            "Technology platforms open new revenue possibilities.",
            "Generosity creates positive financial energy circulation."
        });

        return modifiers.getOrDefault(category, new String[]{
            "Today brings unique opportunities for growth and discovery.",
            "Your intuition guides you toward beneficial choices.",
            "Patience and persistence lead to meaningful progress."
        });
    }


    private int generateSeed(User user, Date date) {
        // Create unique daily seed that changes each day but stays consistent within the day
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        String dateString = dateFormat.format(date);

        // Enhanced personalization factors
        int dayOfWeek = date.getDay();
        int dayOfMonth = date.getDate();
        int weekOfYear = getWeekOfYear(date);

        // Combine multiple factors for richer variation
        String seedString = user.getSurname() + user.getFirstName() + 
                           user.getMonth() + user.getDay() + user.getYear() + 
                           dateString + dayOfWeek + weekOfYear;

        // Add time-of-day factor for some intra-day variation
        int timeFactor = new Date().getHours() / 4; // Changes 6 times per day

        return Math.abs((seedString + timeFactor + dayOfMonth).hashCode());
    }

    private int getWeekOfYear(Date date) {
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(date);
        return cal.get(java.util.Calendar.WEEK_OF_YEAR);
    }

    private Map<String, String[]> initializeProphecyTemplates() {
        Map<String, String[]> templates = new HashMap<>();

        // Simple, clear prophecies that change daily
        templates.put("Aries", new String[]{
            "Today brings new energy and exciting opportunities. Take action on your ideas.",
            "Your leadership skills shine bright today. Others will follow your lead.",
            "A bold decision will open doors. Trust your instincts and move forward.",
            "Today is perfect for starting something new. Your confidence attracts success.",
            "Challenges today will make you stronger. Face them with courage."
        });

        templates.put("Taurus", new String[]{
            "Slow and steady wins today. Focus on building something lasting.",
            "Money matters look promising. A financial opportunity may appear.",
            "Your practical nature solves problems others can't. Use this gift.",
            "Today rewards patience and hard work. Keep pushing forward.",
            "Beauty and comfort surround you today. Enjoy life's simple pleasures."
        });

        templates.put("Gemini", new String[]{
            "Communication is your superpower today. Share your ideas freely.",
            "Learning something new brings unexpected benefits. Stay curious.",
            "Multiple opportunities appear. Choose the one that excites you most.",
            "Your social skills open important doors. Network and connect.",
            "Quick thinking saves the day. Trust your mental agility."
        });

        templates.put("Cancer", new String[]{
            "Family and home bring joy today. Nurture your closest relationships.",
            "Your intuition is especially strong. Listen to your inner voice.",
            "Emotional connections deepen. Someone important enters your life.",
            "Helping others brings unexpected rewards. Your kindness matters.",
            "Past experiences guide today's decisions. Trust your wisdom."
        });

        templates.put("Leo", new String[]{
            "Your natural charisma attracts positive attention. Shine brightly.",
            "Creative projects flourish under today's energy. Express yourself boldly.",
            "Leadership opportunities present themselves. Step into the spotlight.",
            "Your generous spirit brings good karma. Give freely to receive abundantly.",
            "Recognition for past efforts finally arrives. Enjoy your moment."
        });

        templates.put("Virgo", new String[]{
            "Attention to detail pays off handsomely today. Perfection is possible.",
            "Organizing your life brings clarity and peace. Clean up loose ends.",
            "Your helpful nature solves others' problems. This builds strong bonds.",
            "Health and wellness deserve focus today. Take care of your body.",
            "Practical solutions emerge for complex problems. Trust your logic."
        });

        templates.put("Libra", new String[]{
            "Balance in all things brings harmony today. Seek the middle ground.",
            "Partnerships flourish under today's energy. Collaboration is key.",
            "Beauty and art inspire new possibilities. Let creativity flow.",
            "Fairness and justice guide your decisions. Do what's right.",
            "Social connections bring unexpected opportunities. Be diplomatic."
        });

        templates.put("Scorpio", new String[]{
            "Deep insights reveal hidden truths today. Trust your instincts.",
            "Transformation begins with small changes. Start your evolution now.",
            "Your intensity attracts powerful allies. Use this magnetic energy.",
            "Secrets may be revealed that change everything. Stay prepared.",
            "Emotional depth strengthens important relationships. Be vulnerable."
        });

        templates.put("Sagittarius", new String[]{
            "Adventure calls and new horizons beckon. Expand your world today.",
            "Learning and teaching bring mutual benefits. Share your knowledge.",
            "Optimism opens doors that seemed permanently closed. Stay positive.",
            "Travel or foreign connections bring good fortune. Think globally.",
            "Your philosophical nature attracts like-minded souls. Connect deeply."
        });

        templates.put("Capricorn", new String[]{
            "Hard work finally pays off in tangible ways. Your efforts matter.",
            "Leadership positions become available. You're ready to climb higher.",
            "Long-term planning shows positive results. Stay focused on goals.",
            "Responsibility brings respect and recognition. Embrace your duties.",
            "Traditional methods work better than trendy shortcuts. Be classic."
        });

        templates.put("Aquarius", new String[]{
            "Innovation and originality set you apart today. Be uniquely you.",
            "Group activities bring unexpected benefits. Join like-minded people.",
            "Technology or science offers interesting opportunities. Stay current.",
            "Your humanitarian spirit attracts support for good causes. Lead change.",
            "Friendship proves more valuable than money today. Cherish connections."
        });

        templates.put("Pisces", new String[]{
            "Your imagination creates beautiful possibilities today. Dream big.",
            "Spiritual or artistic pursuits bring deep satisfaction. Feed your soul.",
            "Compassion for others opens hearts and minds. Show empathy.",
            "Water-related activities bring peace and clarity. Stay fluid.",
            "Your psychic abilities are heightened today. Trust your feelings."
        });

        return templates;
    }
}

class UserValidator implements Validator {
    @Override
    public boolean validate(Object data) {
        if (!(data instanceof User)) return false;
        User user = (User) data;

        return user.getSurname() != null && !user.getSurname().trim().isEmpty() &&
               user.getFirstName() != null && !user.getFirstName().trim().isEmpty() &&
               user.getGender() != null && !user.getGender().trim().isEmpty() &&
               user.getMonth() >= 1 && user.getMonth() <= 12 &&
               user.getDay() >= 1 && user.getDay() <= 31 &&
               user.getYear() >= 1920 && user.getYear() <= 2024 &&
               Pattern.matches("^[A-Z\\s]*$", user.getSurname()) &&
               Pattern.matches("^[A-Z\\s]*$", user.getFirstName());
    }

    @Override
    public List<String> getValidationErrors(Object data) {
        List<String> errors = new ArrayList<>();
        if (!(data instanceof User)) {
            errors.add("Invalid data type");
            return errors;
        }

        User user = (User) data;
        if (user.getSurname() == null || user.getSurname().trim().isEmpty()) {
            errors.add("Surname is required");
        }
        if (user.getFirstName() == null || user.getFirstName().trim().isEmpty()) {
            errors.add("First name is required");
        }
        if (user.getMonth() < 1 || user.getMonth() > 12) {
            errors.add("Invalid month");
        }
        if (user.getDay() < 1 || user.getDay() > 31) {
            errors.add("Invalid day");
        }

        return errors;
    }
}

class UserCreationTransaction extends Transaction {
    private final User user;
    private final DataPersistence dataPersistence;
    private final ConsultationRecord record;
    private final InMemoryDataPersistence memoryPersistence;

    public UserCreationTransaction(User user, DataPersistence dataPersistence, 
                                  ConsultationRecord record, InMemoryDataPersistence memoryPersistence) {
        this.user = user;
        this.dataPersistence = dataPersistence;
        this.record = record;
        this.memoryPersistence = memoryPersistence;
    }

    @Override
    public void execute() throws Exception {
        dataPersistence.saveUser(user);
        memoryPersistence.addConsultation(record);
    }

    @Override
    public void rollback() throws Exception {
        if (user.getId() != null && dataPersistence.userExists(user.getId())) {
            System.err.println("Would rollback user creation for: " + user.getId());
        }
    }
}

class UserHandler extends BaseHandler {
    private final DataPersistence dataPersistence;
    private final ProphecyGenerator prophecyGenerator;
    private final Validator userValidator;
    private final InMemoryDataPersistence memoryPersistence;

    public UserHandler(DataPersistence dataPersistence, ProphecyGenerator prophecyGenerator,
                      Validator userValidator, InMemoryDataPersistence memoryPersistence) {
        this.dataPersistence = dataPersistence;
        this.prophecyGenerator = prophecyGenerator;
        this.userValidator = userValidator;
        this.memoryPersistence = memoryPersistence;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        setCORSHeaders(exchange);
        if (isOptionsRequest(exchange)) {
            handleOptionsRequest(exchange);
            return;
        }

        if ("POST".equals(exchange.getRequestMethod())) {
            handleUserSubmission(exchange);
        } else {
            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }

    private void handleUserSubmission(HttpExchange exchange) throws IOException {
        try {
            String requestBody = new String(exchange.getRequestBody().readAllBytes());
            User user = parseUserFromJson(requestBody);

            if (userValidator.validate(user)) {
                ConsultationRecord record = new ConsultationRecord(user, prophecyGenerator);
                UserCreationTransaction transaction = new UserCreationTransaction(
                    user, dataPersistence, record, memoryPersistence);

                if (transaction.commit()) {
                    String response = String.format("{\"success\":true,\"userId\":\"%s\",\"zodiacSign\":\"%s\"}", 
                        user.getId(), record.getZodiacSign());
                    sendJsonResponse(exchange, 200, response);
                } else {
                    sendJsonResponse(exchange, 500, "{\"error\":\"Transaction failed\"}");
                }
            } else {
                List<String> errors = userValidator.getValidationErrors(user);
                String errorMessage = String.join(", ", errors);
                sendJsonResponse(exchange, 400, "{\"error\":\"" + errorMessage + "\"}");
            }
        } catch (IOException e) {
            sendJsonResponse(exchange, 500, "{\"error\":\"Internal server error\"}");
        }
    }

    private User parseUserFromJson(String json) {
        User user = new User();
        json = json.replaceAll("[{}\"\\s]", "");
        String[] pairs = json.split(",");

        for (String pair : pairs) {
            String[] keyValue = pair.split(":");
            if (keyValue.length == 2) {
                String key = keyValue[0];
                String value = keyValue[1];

                switch (key) {
                    case "surname" -> user.setSurname(value);
                    case "firstName" -> user.setFirstName(value);
                    case "middleInitial" -> user.setMiddleInitial(value);
                    case "suffix" -> user.setSuffix(value);
                    case "gender" -> user.setGender(value);
                    case "month" -> user.setMonth(Integer.parseInt(value));
                    case "day" -> user.setDay(Integer.parseInt(value));
                    case "year" -> user.setYear(Integer.parseInt(value));
                }
            }
        }

        return user;
    }
}

class ConsultationHandler extends BaseHandler {
    private final DataPersistence dataPersistence;
    private final ProphecyGenerator prophecyGenerator;

    public ConsultationHandler(DataPersistence dataPersistence, ProphecyGenerator prophecyGenerator) {
        this.dataPersistence = dataPersistence;
        this.prophecyGenerator = prophecyGenerator;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        setCORSHeaders(exchange);
        if (isOptionsRequest(exchange)) {
            handleOptionsRequest(exchange);
            return;
        }

        if ("GET".equals(exchange.getRequestMethod())) {
            String query = exchange.getRequestURI().getQuery();
            if (query != null && query.contains("userId=")) {
                String userId = extractParameter(query, "userId");
                User user = dataPersistence.getUserById(userId);
                if (user != null) {
                    Prophecy prophecy = prophecyGenerator.generateProphecy(user, new Date());
                    sendJsonResponse(exchange, 200, prophecy.toJSON());
                } else {
                    sendJsonResponse(exchange, 404, "{\"error\":\"User not found\"}");
                }
            } else {
                sendJsonResponse(exchange, 400, "{\"error\":\"Missing userId parameter\"}");
            }
        }
    }
}

class AdminHandler extends BaseHandler {
    private final InMemoryDataPersistence dataPersistence;

    public AdminHandler(InMemoryDataPersistence dataPersistence) {
        this.dataPersistence = dataPersistence;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        setCORSHeaders(exchange);
        if (isOptionsRequest(exchange)) {
            handleOptionsRequest(exchange);
            return;
        }

        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        if ("GET".equals(method) && path.contains("/stats")) {
            handleGetStats(exchange);
        } else if ("GET".equals(method) && path.contains("/users")) {
            handleGetAllUsers(exchange);
        } else if ("DELETE".equals(method) && path.contains("/clear")) {
            handleClearData(exchange);
        } else if ("GET".equals(method) && path.contains("/export")) {
            handleExportData(exchange);
        } else {
            sendJsonResponse(exchange, 404, "{\"error\":\"Endpoint not found\"}");
        }
    }

    private void handleGetStats(HttpExchange exchange) throws IOException {
        List<ConsultationRecord> consultations = dataPersistence.getAllConsultations();
        int totalUsers = consultations.size();
        long maleUsers = consultations.stream()
            .filter(c -> "MALE".equals(c.getUser().getGender())).count();
        long femaleUsers = consultations.stream()
            .filter(c -> "FEMALE".equals(c.getUser().getGender())).count();

        Date today = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        String todayStr = sdf.format(today);

        long todayConsultations = consultations.stream()
            .filter(c -> sdf.format(c.getTimestamp()).equals(todayStr))
            .count();

        String response = String.format(
            "{\"totalUsers\":%d,\"maleUsers\":%d,\"femaleUsers\":%d,\"todayConsultations\":%d}",
            totalUsers, maleUsers, femaleUsers, todayConsultations
        );

        sendJsonResponse(exchange, 200, response);
    }

    private void handleGetAllUsers(HttpExchange exchange) throws IOException {
        List<ConsultationRecord> consultations = dataPersistence.getAllConsultations();
        StringBuilder json = new StringBuilder("[");
        boolean first = true;

        for (ConsultationRecord record : consultations) {
            if (!first) json.append(",");
            json.append(record.exportToJSON());
            first = false;
        }
        json.append("]");

        sendJsonResponse(exchange, 200, json.toString());
    }

    private void handleClearData(HttpExchange exchange) throws IOException {
        dataPersistence.clearAllData();
        sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"All data cleared\"}");
    }

    private void handleExportData(HttpExchange exchange) throws IOException {
        String format = extractParameter(exchange.getRequestURI().getQuery(), "format");

        if ("csv".equals(format)) {
            String csv = generateCSV();
            exchange.getResponseHeaders().set("Content-Type", "text/csv");
            exchange.getResponseHeaders().set("Content-Disposition", "attachment; filename=zodiac_data.csv");
            exchange.sendResponseHeaders(200, csv.length());
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(csv.getBytes());
            }
        } else {
            handleGetAllUsers(exchange);
        }
    }

    private String generateCSV() {
        List<ConsultationRecord> consultations = dataPersistence.getAllConsultations();
        StringBuilder csv = new StringBuilder();
        csv.append("Surname,First Name,Middle Initial,Suffix,Gender,Month,Day,Year,Zodiac Sign,Consultation Time\n");

        for (ConsultationRecord record : consultations) {
            csv.append(record.exportToCSV()).append("\n");
        }

        return csv.toString();
    }
}

class StaticFileHandler extends BaseHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        setCORSHeaders(exchange);
        if (isOptionsRequest(exchange)) {
            handleOptionsRequest(exchange);
            return;
        }

        String path = exchange.getRequestURI().getPath();
        if (path.equals("/")) path = "/index.html";

        File file = new File("." + path);
        if (file.exists() && file.isFile()) {
            String contentType = getContentType(path);
            exchange.getResponseHeaders().set("Content-Type", contentType);

            byte[] fileContent = Files.readAllBytes(file.toPath());
            exchange.sendResponseHeaders(200, fileContent.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(fileContent);
            }
        } else {
            String response = "File not found: " + path;
            exchange.sendResponseHeaders(404, response.length());
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes());
            }
        }
    }

    private String getContentType(String path) {
        if (path.endsWith(".html")) return "text/html";
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".js")) return "application/javascript";
        if (path.endsWith(".json")) return "application/json";
        if (path.endsWith(".png")) return "image/png";
        if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
        return "text/plain";
    }
}

class ProphecyHandler extends BaseHandler {

    public ProphecyHandler(ProphecyGenerator prophecyGenerator) {
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        setCORSHeaders(exchange);
        if (isOptionsRequest(exchange)) {
            handleOptionsRequest(exchange);
            return;
        }

        if ("POST".equals(exchange.getRequestMethod())) {
            String requestBody = new String(exchange.getRequestBody().readAllBytes());
            String prophecy = generateDailyProphecy(requestBody);
            sendJsonResponse(exchange, 200, prophecy);
        }
    }

    private String generateDailyProphecy(@SuppressWarnings("unused") String requestData) {
        return "{\"success\":true,\"prophecy\":\"Your daily cosmic guidance is revealed\"}";
    }
}

public class ZodiacServer {
    private static final int PORT = 8080;
    private static InMemoryDataPersistence dataPersistence;
    private static ProphecyGenerator prophecyGenerator;
    private static Validator userValidator;

    public static void main(String[] args) throws IOException {
        initializeComponents();

        HttpServer server = HttpServer.create(new InetSocketAddress("0.0.0.0", PORT), 0);

        server.createContext("/", new StaticFileHandler());
        server.createContext("/api/users", new UserHandler(dataPersistence, prophecyGenerator, userValidator, dataPersistence));
        server.createContext("/api/consultations", new ConsultationHandler(dataPersistence, prophecyGenerator));
        server.createContext("/api/admin", new AdminHandler(dataPersistence));
        server.createContext("/api/prophecy", new ProphecyHandler(prophecyGenerator));

        server.setExecutor(Executors.newFixedThreadPool(10));
        server.start();

        System.out.println("🌟 Zodiac Prophecy Server started on http://0.0.0.0:" + PORT);
        System.out.println("📊 Admin Panel: http://0.0.0.0:" + PORT + "/admin.html");
        System.out.println("🔮 Main Application: http://0.0.0.0:" + PORT + "/index.html");
    }

    private static void initializeComponents() {
        dataPersistence = new InMemoryDataPersistence();
        prophecyGenerator = new ZodiacProphecyGenerator();
        userValidator = new UserValidator();
    }
}
