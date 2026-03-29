"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { InsightPanel } from "../../components/InsightPanel";
import { GlobalAudioButton } from "../../components/AudioContext";
import { ArrowLeft, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

// Mock data (keep exactly the same)
const siddurData: Record<string, { title: string, subtitle?: string, parts?: { id: string, title: string, verses: { id: string, hebrew: string, english: string, isSection?: boolean, isImage?: boolean, imageUrl?: string }[] }[], verses?: { id: string, hebrew: string, english: string, isSection?: boolean, isImage?: boolean, imageUrl?: string }[] }> = {
  morning: {
    title: "Morning Prayers",
    subtitle: "Shacharis",
    parts: [
      {
        id: "morning_blessings",
        title: "Awakening the Soul",
        verses: [
      { id: "sec1", hebrew: "", english: "Awakening the Soul", isImage: true, imageUrl: "/images/morning_sun.png" },
      { id: "v1_1", hebrew: "מוֹדֶה אֲנִי לְפָנֶֽיךָ מֶֽלֶךְ חַי וְקַיָּם שֶׁהֶחֱזַֽרְתָּ בִּי נִשְׁמָתִי בְּחֶמְלָה. רַבָּה אֱמוּנָתֶֽךָ:", english: "I offer thanks to You, living and eternal King, for You have mercifully restored my soul within me; Your faithfulness is great." },
      { id: "v2_1", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶֽלֶךְ הָעוֹלָם אֲשֶׁר קִדְּשָֽׁנוּ בְּמִצְוֹתָיו, וְצִוָּנוּ עַל נְטִילַת יָדָֽיִם:", english: "Blessed are You, Lord our God, King of the universe, who has sanctified us with His commandments, and commanded us concerning the washing of the hands." },
      { id: "v2_2a", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶֽלֶךְ הָעוֹלָם, אֲשֶׁר יָצַר אֶת הָאָדָם בְּחָכְמָה, וּבָֽרָא בוֹ נְקָבִים נְקָבִים, חֲלוּלִים חֲלוּלִים,", english: "Blessed are You, Lord our God, King of the universe, who has formed man in wisdom, and created within him numerous orifices and cavities." },
      { id: "v2_2b", hebrew: "גָּלוּי וְיָדֽוּעַ לִפְנֵי כִסֵּא כְבוֹדֶֽךָ, שֶׁאִם יִסָּתֵם אֶחָד מֵהֶם, אוֹ אִם יִפָּתֵֽחַ אֶחָד מֵהֶם, אִי אֶפְשַׁר לְהִתְקַיֵּם אֲפִילוּ שָׁעָה אֶחָת.", english: "It is revealed and known before the throne of Your glory that if but one of them were to be blocked, or one of them were to be opened, it would be impossible to exist for even a short while." },
      { id: "v2_2c", hebrew: "בָּרוּךְ אַתָּה יְיָ רוֹפֵא כָל בָּשָׂר וּמַפְלִיא לַעֲשׂוֹת:", english: "Blessed are You, Lord, who heals all flesh and acts wondrously." },
      { id: "v2_3a", hebrew: "אֱלֹהַי, נְשָׁמָה שֶׁנָּתַֽתָּ בִּי טְהוֹרָה הִיא, אַתָּה בְרָאתָהּ, אַתָּה יְצַרְתָּהּ, אַתָּה נְפַחְתָּהּ בִּי,", english: "My God, the soul that You have placed within me is pure. You created it, You formed it, You breathed it into me," },
      { id: "v2_3b", hebrew: "וְאַתָּה מְשַׁמְּרָהּ בְּקִרְבִּי, וְאַתָּה עָתִיד לִטְּלָהּ מִמֶּֽנִּי, וּלְהַחֲזִירָהּ בִּי לֶעָתִיד לָבֹא.", english: "and You preserve it within me. And You will eventually take it from me, and restore it to me in the Time to Come." },
      { id: "v2_3c", hebrew: "כָּל זְמַן שֶׁהַנְּשָׁמָה בְּקִרְבִּי, מוֹדֶה אֲנִי לְפָנֶֽיךָ יְיָ אֱלֹהַי וֵאלֹהֵי אֲבוֹתַי, רִבּוֹן כָּל הַמַּעֲשִׂים, אֲדוֹן כָּל הַנְּשָׁמוֹת.", english: "As long as the soul is within me, I offer thanks to You, Lord my God and God of my fathers, Master of all deeds, Lord of all souls." },
      { id: "v2_3d", hebrew: "בָּרוּךְ אַתָּה יְיָ הַמַּחֲזִיר נְשָׁמוֹת לִפְגָרִים מֵתִים:", english: "Blessed are You, Lord, who restores souls to dead bodies." },
      { id: "v2_4", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶלֶךְ הָעוֹלָם, הַנּוֹתֵן לַשֶּׂכְוִי בִינָה לְהַבְחִין בֵּין יוֹם וּבֵין לָיְלָה:", english: "Blessed are You, Lord our God, King of the universe, who gives the rooster understanding to distinguish between day and night." },
      { id: "v2_5", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶלֶךְ הָעוֹלָם, פּוֹקֵחַ עִוְרִים:", english: "Blessed are You, Lord our God, King of the universe, who opens the eyes of the blind." },
      { id: "v2_6", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶלֶךְ הָעוֹלָם, מַתִּיר אֲסוּרִים:", english: "Blessed are You, Lord our God, King of the universe, who frees the captives." },
      { id: "v2_7", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶלֶךְ הָעוֹלָם, זוֹקֵף כְּפוּפִים:", english: "Blessed are You, Lord our God, King of the universe, who straightens the bent." },
      { id: "v2_8", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶלֶךְ הָעוֹלָם, מַלְבִּישׁ עֲרֻמִּים:", english: "Blessed are You, Lord our God, King of the universe, who clothes the naked." },
      { id: "v2_9", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶלֶךְ הָעוֹלָם, הַנּוֹתֵן לַיָּעֵף כֹּחַ:", english: "Blessed are You, Lord our God, King of the universe, who gives strength to the weary." },
      { id: "v2_10", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶלֶךְ הָעוֹלָם, רוֹקַע הָאָרֶץ עַל הַמָּיִם:", english: "Blessed are You, Lord our God, King of the universe, who spreads the earth above the waters." },
      { id: "v2_11", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶלֶךְ הָעוֹלָם, הַמֵּכִין מִצְעֲדֵי גָבֶר:", english: "Blessed are You, Lord our God, King of the universe, who directs the steps of man." },
      { id: "v2_12", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשָׂה לִּי כָּל צָרְכִּי:", english: "Blessed are You, Lord our God, King of the universe, who has provided me with all my needs." },
      { id: "v2_13", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶלֶךְ הָעוֹלָם, אוֹזֵר יִשְׂרָאֵל בִּגְבוּרָה:", english: "Blessed are You, Lord our God, King of the universe, who girds Israel with strength." },
      { id: "v2_14", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶלֶךְ הָעוֹלָם, עוֹטֵר יִשְׂרָאֵל בְּתִפְאָרָה:", english: "Blessed are You, Lord our God, King of the universe, who crowns Israel with splendor." },
      { id: "v2_15", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶלֶךְ הָעוֹלָם, שֶׁלֹּא עָשַׂנִי גּוֹי:", english: "Blessed are You, Lord our God, King of the universe, who has not made me a gentile." },
      { id: "v2_16", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶלֶךְ הָעוֹלָם, שֶׁלֹּא עָשַׂנִי עָבֶד:", english: "Blessed are You, Lord our God, King of the universe, who has not made me a slave." },
      { id: "v2_17", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶלֶךְ הָעוֹלָם, שֶׁלֹּא עָשַׂנִי אִשָּׁה:", english: "Blessed are You, Lord our God, King of the universe, who has not made me a woman." },
      { id: "v2_18a", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶלֶךְ הָעוֹלָם, הַמַּעֲבִיר שֵׁנָה מֵעֵינָי וּתְנוּמָה מֵעַפְעַפָּי:", english: "Blessed are You, Lord our God, King of the universe, who removes sleep from my eyes and slumber from my eyelids." },
      { id: "v2_18b", hebrew: "וִיהִי רָצוֹן מִלְּפָנֶיךָ יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, שֶׁתַּרְגִּילֵנוּ בְּתוֹרָתֶךָ, וְתַדְבִּקֵנוּ בְּמִצְוֹתֶיךָ,", english: "And may it be Your will, Lord our God and God of our fathers, that You accustom us to Your Torah, and attach us to Your commandments," },
      { id: "v2_18c", hebrew: "וְאַל תְּבִיאֵנוּ לֹא לִידֵי חֵטְא וְלֹא לִידֵי עֲבֵרָה וְעָוֹן וְלֹא לִידֵי נִסָּיוֹן וְלֹא לִידֵי בִזָּיוֹן,", english: "and bring us not into the hands of sin, transgression, or iniquity, nor into the hands of temptation or disgrace." },
      { id: "v2_18d", hebrew: "וְאַל יִשְׁלוֹט בָּנוּ יֵצֶר הָרָע, וְהַרְחִיקֵנוּ מֵאָדָם רָע, וּמֵחָבֵר רָע,", english: "And let not the evil inclination rule over us, and distance us from an evil person and a bad associate," },
      { id: "v2_18e", hebrew: "וְדַבְּקֵנוּ בְּיֵצֶר טוֹב וּבְמַעֲשִׂים טוֹבִים, וְכוֹף אֶת יִצְרֵנוּ לְהִשְׁתַּעְבֶּד לָךְ,", english: "and attach us to the good inclination and to good deeds, and compel our inclination to be subjugated to You." },
      { id: "v2_18f", hebrew: "וּתְנֵנוּ הַיּוֹם וּבְכָל יוֹם לְחֵן וּלְחֶסֶד וּלְרַחֲמִים בְּעֵינֶיךָ וּבְעֵינֵי כָל רוֹאֵינוּ, וְתִגְמְלֵנוּ חֲסָדִים טוֹבִים.", english: "And grant us today and every day grace, lovingkindness, and mercy in Your eyes and in the eyes of all who see us, and bestow upon us good kindnesses." },
      { id: "v2_18g", hebrew: "בָּרוּךְ אַתָּה יְיָ, הַגּוֹמֵל חֲסָדִים טוֹבִים לְעַמּוֹ יִשְׂרָאֵל:", english: "Blessed are You, Lord, who bestows good kindnesses upon His people Israel." },
      { id: "v2_19a", hebrew: "יְהִי רָצוֹן מִלְּפָנֶיךָ יְיָ אֱלֹהַי וֵאלֹהֵי אֲבוֹתַי, שֶׁתַּצִּילֵנִי הַיּוֹם וּבְכָל יוֹם מֵעַזֵּי פָנִים, וּמֵעַזּוּת פָּנִים,", english: "May it be Your will, Lord my God and God of my fathers, that You rescue me today and every day from brazen men, and from brazenness," },
      { id: "v2_19b", hebrew: "מֵאָדָם רָע, וּמֵחָבֵר רָע, וּמִשָּׁכֵן רָע, וּמִפֶּגַע רָע,", english: "from an evil person, and from a bad associate, and from an evil neighbor, and from an evil occurrence," },
      { id: "v2_19c", hebrew: "מֵעַיִן הָרָע, מִלָּשׁוֹן הָרָע, מִמַּלְשִׁינוּת, מֵעֵדוּת שֶׁקֶר, מִשִּׂנְאַת הַבְּרִיּוֹת, מֵעֲלִילָה,", english: "from the evil eye, from the evil tongue, from slander, from false testimony, from the hatred of others, from false accusation," },
      { id: "v2_19d", hebrew: "מִמִּיתָה מְשֻׁנָּה, מֵחֳלָיִם רָעִים, וּמִמִּקְרִים רָעִים,", english: "from unnatural death, from severe illnesses, and from unfortunate events," },
      { id: "v2_19e", hebrew: "וּמִשָּׂטָן הַמַּשְׁחִית מִדִּין קָשֶׁה, וּמִבַּעַל דִּין קָשֶׁה, בֵּין שֶׁהוּא בֶן בְּרִית, וּבֵין שֶׁאֵינוֹ בֶן בְּרִית. וּמִדִּינָהּ שֶׁל גֵּיהִנֹּם:", english: "and from the destructive adversary, from a harsh judgment, and from a harsh litigant, whether he is a member of the covenant or whether he is not a member of the covenant, and from the judgment of Gehinnom." },
      { id: "v2_20a", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו, וְצִוָּנוּ עַל דִּבְרֵי תוֹרָה:", english: "Blessed are You, Lord our God, King of the universe, who has sanctified us with His commandments, and commanded us concerning the words of Torah." },
      { id: "v2_20b", hebrew: "וְהַעֲרֶב נָא יְיָ אֱלֹהֵינוּ אֶת דִּבְרֵי תוֹרָתְךָ בְּפִינוּ, וּבְפִי כָל עַמְּךָ בֵּית יִשְׂרָאֵל,", english: "Please, Lord our God, make the words of Your Torah pleasant in our mouths, and in the mouths of Your entire people, the House of Israel," },
      { id: "v2_20c", hebrew: "וְנִהְיֶה אֲנַחְנוּ וְצֶאֱצָאֵינוּ, וְצֶאֱצָאֵי כָל עַמְּךָ בֵּית יִשְׂרָאֵל, כֻּלָּנוּ יוֹדְעֵי שְׁמֶךָ וְלוֹמְדֵי תוֹרָתֶךָ לִשְׁמָהּ.", english: "so that we and our descendants, and the descendants of Your entire people, the House of Israel, may all be those who know Your name and study Your Torah for its own sake." },
      { id: "v2_20d", hebrew: "בָּרוּךְ אַתָּה יְיָ, הַמְלַמֵּד תּוֹרָה לְעַמּוֹ יִשְׂרָאֵל:", english: "Blessed are You, Lord, who teaches Torah to His people Israel." },
      { id: "v2_21", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר בָּחַר בָּנוּ מִכָּל הָעַמִּים וְנָתַן לָנוּ אֶת תּוֹרָתוֹ. בָּרוּךְ אַתָּה יְיָ. נוֹתֵן הַתּוֹרָה:", english: "Blessed are You, Lord our God, King of the universe, who has chosen us from all the nations and given us His Torah. Blessed are You, Lord, Giver of the Torah." },
      { id: "v2_22a", hebrew: "וַיְדַבֵּר יְיָ אֶל משֶׁה לֵּאמֹר: דַּבֵּר אֶל אַהֲרֹן וְאֶל בָּנָיו לֵאמֹר, כֹּה תְבָרְכוּ אֶת בְּנֵי יִשְׂרָאֵל אָמוֹר לָהֶם:", english: "And the Lord spoke to Moses, saying: Speak to Aaron and to his sons, saying, so shall you bless the children of Israel, say to them:" },
      { id: "v2_22b", hebrew: "יְבָרֶכְךָ יְיָ וְיִשְׁמְרֶךָ:", english: "May the Lord bless you and keep you." },
      { id: "v2_22c", hebrew: "יָאֵר יְיָ פָּנָיו אֵלֶיךָ וִיחֻנֶּךָּ:", english: "May the Lord shine His face upon you and be gracious to you." },
      { id: "v2_22d", hebrew: "יִשָּׂא יְיָ פָּנָיו אֵלֶיךָ וְיָשֵׂם לְךָ שָׁלוֹם:", english: "May the Lord turn His face toward you and grant you peace." },
      { id: "v2_22e", hebrew: "וְשָׂמוּ אֶת שְׁמִי עַל בְּנֵי יִשְׂרָאֵל וַאֲנִי אֲבָרֲכֵם:", english: "And they shall place My name upon the children of Israel, and I will bless them." },
      { id: "v2_23a", hebrew: "אֵלּוּ דְבָרִים שֶׁאֵין לָהֶם שִׁעוּר: הַפֵּאָה, וְהַבִּכּוּרִים, וְהָרְאָיוֹן, וּגְמִילוּת חֲסָדִים, וְתַלְמוּד תּוֹרָה:", english: "These are the precepts whose measure is not restricted: pe'ah, first fruits, the appearance offering, acts of lovingkindness, and the study of Torah." },
      { id: "v2_23b", hebrew: "אֵלּוּ דְבָרִים שֶׁאָדָם אוֹכֵל פֵּרוֹתֵיהֶם בָּעוֹלָם הַזֶּה וְהַקֶּרֶן קַיֶּמֶת לָעוֹלָם הַבָּא, וְאֵלּוּ הֵן:", english: "These are the precepts whose fruits a person enjoys in this world, while the principal remains intact for him in the World to Come. And they are:" },
      { id: "v2_23c", hebrew: "כִּבּוּד אָב וָאֵם, וּגְמִילוּת חֲסָדִים, וְהַשְׁכָּמַת בֵּית הַמִּדְרָשׁ שַׁחֲרִית וְעַרְבִית,", english: "honoring one's father and mother, acts of lovingkindness, early attendance at the study hall morning and evening," },
      { id: "v2_23d", hebrew: "וְהַכְנָסַת אוֹרְחִים, וּבִקּוּר חוֹלִים, וְהַכְנָסַת כַּלָּה וְהַלְוָיַת הַמֵּת", english: "hospitality to guests, visiting the sick, bringing the bride to the marital canopy, escorting the dead," },
      { id: "v2_23e", hebrew: "וְעִיּוּן תְּפִלָּה וַהֲבָאַת שָׁלוֹם שֶׁבֵּין אָדָם לַחֲבֵרוֹ, וּבֵין אִישׁ לְאִשְׁתּוֹ, וְתַלְמוּד תּוֹרָה כְּנֶגֶד כֻּלָּם:", english: "concentration in prayer, bringing peace between a man and his fellow and between a husband and his wife, and the study of Torah is equivalent to them all." },
      { id: "v3_1", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְצִוָּנוּ עַל מִצְוַת צִיצִית:", english: "Blessed are You, Lord our God, King of the universe, who has sanctified us with His commandments and commanded us concerning the mitzvah of tzitzit." },
      { id: "v3_2", hebrew: "בָּרְכִי נַפְשִׁי אֶת־יְיָ יְיָ אֱלֹהַי גָּדַלְתָּ מְּאֹד הוֹד וְהָדָר לָבָשְׁתָּ׃ עֹטֶה־אוֹר כַּשַּׂלְמָה נוֹטֶה שָׁמַיִם כַּיְרִיעָה׃", english: "Bless the Lord, O my soul! O Lord my God, You are very great; You are clothed with glory and majesty. Who cover Yourself with light as with a garment, who stretch out the heavens like a curtain." },
      { id: "v3_3", hebrew: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵֽינוּ מֶֽלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָֽׁנוּ בְּמִצְוֹתָיו, וְצִוָּנוּ לְהִתְעַטֵּף בְּצִּיצִית:", english: "Blessed are You, Lord our God, King of the universe, who has sanctified us with His commandments, and commanded us to wrap ourselves in tzitzit." },
      { id: "v3_4a", hebrew: "מַה יָּקָר חַסְדְּךָ אֱלֹהִים וּבְנֵי אָדָם בְּצֵל כְּנָפֶֽיךָ יֶחֱסָֽיוּן:", english: "How precious is Your lovingkindness, O God! And the children of men take refuge in the shadow of Your wings." },
      { id: "v3_4b", hebrew: "יִרְוְיֻן מִדֶּֽשֶׁן בֵּיתֶֽךָ וְנַֽחַל עֲדָנֶֽיךָ תַשְׁקֵם:", english: "They will be saturated with the abundance of Your house, and You will give them to drink from the stream of Your delights." },
      { id: "v3_4c", hebrew: "כִּי־עִמְּךָ מְקוֹר חַיִּים, בְּאוֹרְךָ נִרְאֶה־אוֹר:", english: "For with You is the source of life; in Your light we see light." },
      { id: "v3_4d", hebrew: "מְשֹׁךְ חַסְדְּךָ לְיֹדְעֶֽיךָ וְצִדְקָתְךָ לְיִשְׁרֵי־לֵב:", english: "Draw out Your lovingkindness to those who know You, and Your righteousness to the upright in heart." }
        ]
      },
      {
        id: "pesukei_dzimra",
        title: "Verses of Praise",
        verses: [{ id: "pd1", hebrew: "", english: "Coming soon." }]
      },
      {
        id: "shema",
        title: "Shema & Blessings",
        verses: [{ id: "sh1", hebrew: "", english: "Coming soon." }]
      },
      {
        id: "amidah",
        title: "The Amidah",
        verses: [{ id: "am1", hebrew: "", english: "Coming soon." }]
      },
      {
        id: "concluding",
        title: "Concluding Prayers",
        verses: [{ id: "cp1", hebrew: "", english: "Coming soon." }]
      }
    ]
  },
  afternoon: {
    title: "Afternoon Prayers",
    verses: [
      { id: "a1", hebrew: "", english: "Coming soon." }
    ]
  },
  evening: {
    title: "Evening Prayers",
    verses: [
      { id: "e1", hebrew: "", english: "Coming soon." }
    ]
  }
};


const TwinklingDots = () => (
  <div className="sparkle-dots">
    <div className="sparkle-dot d1"></div>
    <div className="sparkle-dot d2"></div>
    <div className="sparkle-dot d3"></div>
  </div>
);

function SiddurViewContent() {
  const params = useParams();
  const categoryParam = typeof params?.category === 'string' ? params.category : "morning";
  const selectedTefillah = siddurData[categoryParam] || siddurData["morning"];

  const [activePartId, setActivePartId] = useState("");
  const [partsMenuOpen, setPartsMenuOpen] = useState(false);
  const [activeVerse, setActiveVerse] = useState<{ id: string, hebrew: string, english: string } | null>(null);
  const [languagePref, setLanguagePref] = useState("English & Hebrew");
  const [scrolled, setScrolled] = useState(false);
  const searchParams = useSearchParams();
  const verseQuery = searchParams.get("v");

  const activePart = selectedTefillah.parts?.find(p => p.id === activePartId) || selectedTefillah.parts?.[0];
  const currentVerses = activePart ? activePart.verses : (selectedTefillah.verses || []);

  useEffect(() => {
    if (selectedTefillah.parts && selectedTefillah.parts.length > 0) {
      if (!selectedTefillah.parts.find(p => p.id === activePartId)) {
        setActivePartId(selectedTefillah.parts[0].id);
      }
    } else {
      setActivePartId("");
    }
  }, [categoryParam, selectedTefillah.parts]);

  useEffect(() => {
    if (verseQuery && selectedTefillah) {
      if (selectedTefillah.parts) {
        let foundPart = selectedTefillah.parts.find(p => p.verses.some(v => v.id === verseQuery));
        if (foundPart) {
          setActivePartId(foundPart.id);
          const verseToDeepLink = foundPart.verses.find(v => v.id === verseQuery);
          if (verseToDeepLink) {
            setTimeout(() => setActiveVerse(verseToDeepLink), 300);
          }
        }
      } else if (selectedTefillah.verses) {
        const verseToDeepLink = selectedTefillah.verses.find((v) => v.id === verseQuery);
        if (verseToDeepLink) {
          setTimeout(() => setActiveVerse(verseToDeepLink), 300);
        }
      }
    }
  }, [verseQuery, selectedTefillah]);

  useEffect(() => {
    setLanguagePref(localStorage.getItem("legani_language") || "English & Hebrew");
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="zen-siddur">
      <nav className={`zen-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <Link href="/home" className="zen-back-link group" aria-label="Go back">
            <ArrowLeft size={20} strokeWidth={1} className="back-icon group-hover:-translate-x-1 transition-transform" />
          </Link>
          {selectedTefillah.parts && selectedTefillah.parts.length > 1 ? (
            <button className="zen-nav-title interactive-nav-title group" onClick={() => setPartsMenuOpen(true)}>
              {selectedTefillah.title}
              <ChevronDown size={14} className="nav-title-icon group-hover:translate-y-0.5 transition-transform" />
            </button>
          ) : (
            <span className="zen-nav-title">{selectedTefillah.title}</span>
          )}
          <div className="spacer">
            <GlobalAudioButton />
          </div>
        </div>
      </nav>

      <div className="zen-content">
        <header className="zen-header animate-fade-in">
          <h1 className="zen-main-title">{selectedTefillah.title}</h1>
          {selectedTefillah.parts && selectedTefillah.parts.length > 1 ? (
             <button 
               className="zen-part-selector group"
               onClick={() => setPartsMenuOpen(true)}
             >
               <span className="part-selector-text">{activePart?.title || selectedTefillah.subtitle}</span>
               <ChevronDown size={14} className="part-selector-icon group-hover:translate-y-0.5 transition-transform" />
             </button>
          ) : (
             selectedTefillah.subtitle && <p className="zen-main-subtitle">{selectedTefillah.subtitle}</p>
          )}
        </header>

        <div className="zen-verses">
          {currentVerses.map((verse, index) => {
            if (verse.isImage) {
              return (
                <div key={verse.id} className="zen-verse-wrapper">
                  <div className="zen-illustration-section animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="illustration-container">
                      <img src={verse.imageUrl} alt={verse.english} className="illustration-image" />
                    </div>
                  </div>
                </div>
              );
            }

            if (verse.isSection) {
              return (
                <div key={verse.id} className="zen-verse-wrapper">
                  <div className="zen-section-title-wrap animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <h2 className="zen-section-hebrew">{verse.hebrew}</h2>
                    <h3 className="zen-section-english">{verse.english}</h3>
                  </div>
                </div>
              );
            }

            return (
              <div key={verse.id} className="zen-verse-wrapper">
                <div 
                  className="zen-verse-block animate-fade-in group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setActiveVerse(verse)}
                >
                  <div className="zen-verse-inner">
                    {languagePref !== "English Only" && verse.hebrew && (
                      <p className="zen-hebrew">{verse.hebrew}</p>
                    )}
                    {languagePref !== "Hebrew Only" && verse.english && (
                      <p className="zen-english">{verse.english}</p>
                    )}
                  </div>
                </div>
                
                {index < currentVerses.length - 1 && currentVerses[index + 1]?.isSection !== true && (
                  <div 
                    className="verse-separator animate-fade-in"
                    style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
                  >
                    <img src={`/images/verse_divider_${['wave', 'stream', 'horizon', 'mountain'][index % 4]}.png?v=fixed`} alt="divider" className="verse-divider-image" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {partsMenuOpen && selectedTefillah.parts && (
        <div className="parts-overlay animate-fade-in" onClick={() => setPartsMenuOpen(false)}>
          <div className="parts-menu-content" onClick={e => e.stopPropagation()}>
            <button className="parts-close-btn" onClick={() => setPartsMenuOpen(false)}>
              <X size={24} strokeWidth={1} />
            </button>
            <h3 className="parts-menu-title">Select Part</h3>
            <div className="parts-list">
              {selectedTefillah.parts.map(p => (
                <button 
                  key={p.id} 
                  className={`part-menu-item ${activePartId === p.id ? 'active' : ''}`}
                  onClick={() => {
                    setActivePartId(p.id);
                    setPartsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                   {p.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <InsightPanel 
        isOpen={!!activeVerse}
        onClose={() => setActiveVerse(null)}
        verseId={activeVerse?.id || ""}
        verseTextHebrew={activeVerse?.hebrew || ""}
        verseTextEnglish={activeVerse?.english || ""}
        dividerImageUrl={activeVerse ? `/images/verse_divider_${['wave', 'stream', 'horizon', 'mountain'][Math.max(0, currentVerses.findIndex(v => v.id === activeVerse.id)) % 4]}.png?v=fixed` : undefined}
      />

      <style jsx>{`
        .zen-siddur {
          min-height: 100vh;
          background: var(--bg-primary);
          padding-bottom: 15rem;
        }
        
        .zen-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 80px;
          z-index: 50;
          transition: all var(--transition-normal);
          background: var(--bg-primary);
          border-bottom: 1px solid transparent;
        }
        
        .zen-nav.scrolled {
          height: 64px;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-light);
        }
        
        .nav-content {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 100%;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
        }
        
        .zen-back-link {
          display: inline-flex;
          align-items: center;
          color: var(--text-tertiary);
          transition: color var(--transition-fast);
          justify-self: start;
        }
        
        .zen-back-link:hover {
          color: var(--text-primary);
        }
        
        .back-icon {
          color: var(--text-tertiary);
          transition: color var(--transition-fast);
        }
        
        .zen-back-link:hover .back-icon {
          color: var(--text-primary);
        }
        
        .zen-nav-title {
          font-weight: 200;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          color: var(--text-primary);
          text-align: center;
          white-space: nowrap;
          opacity: 0;
          transform: translateY(10px);
          transition: all var(--transition-normal);
          text-transform: uppercase;
          justify-self: center;
        }
        
        .zen-nav.scrolled .zen-nav-title {
          opacity: 1;
          transform: translateY(0);
        }

        .interactive-nav-title {
          background: none;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-family: inherit;
        }

        .interactive-nav-title:hover {
          color: var(--text-secondary);
        }

        .nav-title-icon {
          color: var(--text-tertiary);
          transition: transform var(--transition-fast), color var(--transition-fast);
        }

        .interactive-nav-title:hover .nav-title-icon {
          color: var(--text-primary);
        }
        
        .spacer {
          justify-self: end;
          display: flex;
          align-items: center;
        }

        .zen-content {
          padding-top: 150px;
          max-width: 720px;
          margin: 0 auto;
          padding-left: 5vw;
          padding-right: 5vw;
        }
        
        .zen-header {
          text-align: center;
          margin-bottom: 5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3rem;
        }
        
        .zen-main-title {
          font-size: clamp(2.5rem, 2rem + 3vw, 4rem);
          font-weight: 200;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .zen-main-subtitle {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          color: var(--text-secondary);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-top: 1rem;
        }

        .zen-part-selector {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          cursor: pointer;
          font-family: var(--font-serif);
          font-size: 1.15rem;
          color: var(--text-secondary);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          transition: all var(--transition-normal);
          padding: 0.5rem 1rem;
        }

        .zen-part-selector:hover {
          color: var(--text-primary);
        }

        .part-selector-icon {
          color: var(--text-tertiary);
          transition: transform var(--transition-fast), color var(--transition-fast);
        }

        .zen-part-selector:hover .part-selector-icon {
          color: var(--text-primary);
        }

        .parts-overlay {
          position: fixed;
          inset: 0;
          background: var(--bg-primary);
          z-index: 200;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .parts-menu-content {
          width: 90%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .parts-close-btn {
          position: absolute;
          top: -4rem;
          color: var(--text-tertiary);
          background: none;
          border: none;
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .parts-close-btn:hover { 
          color: var(--text-primary); 
        }

        .parts-menu-title {
          font-family: var(--font-serif);
          font-size: 0.85rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-bottom: 3rem;
        }

        .parts-list {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          width: 100%;
          align-items: center;
        }

        .part-menu-item {
          background: none;
          border: none;
          font-family: var(--font-serif);
          font-size: 1.25rem;
          font-weight: 300;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          padding: 0.5rem;
          text-transform: uppercase;
          text-align: center;
        }

        .part-menu-item:hover {
          color: var(--text-primary);
        }

        .part-menu-item.active {
          color: var(--text-primary);
        }
        
        .zen-hairline {
          width: 1px;
          height: 60px;
          background-color: var(--text-tertiary);
          opacity: 0.5;
        }
        
        .zen-verses {
          display: flex;
          flex-direction: column;
        }

        .zen-verse-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .zen-section-title-wrap {
          text-align: center;
          margin: 3rem 0 1.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border-light);
          width: 80%;
        }

        .zen-section-hebrew {
          font-family: var(--font-hebrew);
          font-size: var(--text-2xl);
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          font-weight: 400;
          direction: rtl;
        }

        .zen-section-english {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-weight: 300;
        }


        
        .zen-illustration-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0 0 4rem;
          width: 100%;
        }

        .illustration-container {
          width: 80%;
          max-width: 400px;
          margin-bottom: 2rem;
        }

        .illustration-image {
          width: 100%;
          height: auto;
          mix-blend-mode: multiply;
          opacity: 0.85;
          filter: grayscale(100%);
        }

        .illustration-text {
          text-align: center;
          color: var(--text-primary);
        }

        .illustration-text h3 {
          font-family: var(--font-serif);
          font-size: clamp(1.5rem, 5vw, 2.5rem);
          font-weight: 300;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .illustration-line {
          width: 30px;
          height: 1px;
          background: var(--text-tertiary);
          margin: 0 auto 1rem;
          opacity: 0.3;
        }

        .illustration-text p {
          font-size: 0.85rem;
          font-weight: 300;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }


        .verse-separator {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          padding: 1rem 0;
          opacity: 0.4;
        }

        .verse-divider-image {
          width: 90%;
          max-width: 500px;
          aspect-ratio: 4.5 / 1;
          object-fit: cover;
          object-position: center;
          opacity: 0.85;
          /* No mix-blend-mode or contrast needed now since it's truly transparent */
        }
        
.zen-verse-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          position: relative;
          padding: 1.5rem 0;
        }

        .zen-verse-wrapper:first-child .zen-verse-block {
          padding-top: 0;
        }

        .zen-verse-wrapper:last-child .zen-verse-block {
          padding-bottom: 0;
        }
        
        .zen-verse-inner {
          text-align: center;
          transition: opacity var(--transition-normal);
        }
        
        .zen-hebrew {
          font-family: var(--font-hebrew);
          font-size: var(--text-hebrew-lg);
          margin-bottom: 2rem;
          color: var(--text-primary);
          line-height: 1.6;
          direction: rtl;
        }
        
        .zen-english {
          font-size: var(--text-lg);
          color: var(--text-primary);
          line-height: 1.8;
          font-weight: 400;
          max-width: 85%;
          margin: 0 auto;
        }
        
        .trigger-line {
          display: none;
        }
        
        @media (max-width: 768px) {
          .zen-nav { height: 80px; }
          .zen-content { padding-top: 120px; }
          .zen-header { margin-bottom: 5rem; }
          .zen-english { max-width: 100%; }
        }
      `}</style>
    </main>
  );
}

export default function SiddurView() {
  return (
    <Suspense fallback={null}>
      <SiddurViewContent />
    </Suspense>
  );
}
