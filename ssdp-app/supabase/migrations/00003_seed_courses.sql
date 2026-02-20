-- ============================================
-- SEED DATA: Courses, Modules, and Quizzes
-- HOPE (5 modules), THR (4 modules), Ambassador (3 modules)
-- ============================================

-- ============================================
-- COURSE 1: HOPE — Overdose Prevention Training
-- ============================================

INSERT INTO courses (id, title, description, track, duration_minutes, module_count, required_role, sort_order, is_published, partner_name, points_bonus)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'HOPE: Overdose Prevention Training',
  'Learn how to recognize and respond to an opioid overdose. This life-saving training covers overdose signs, Good Samaritan laws, naloxone administration, and harm reduction principles.',
  'drug_education',
  60,
  5,
  'registered',
  1,
  true,
  'SSDP HOPE Program',
  20
);

-- Module 1.1: What is an Opioid Overdose
INSERT INTO modules (id, course_id, title, content_markdown, sort_order, points_reward)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'What is an Opioid Overdose',
  'An opioid overdose occurs when opioids overwhelm the brain''s ability to regulate breathing. The brain''s opioid receptors, which normally manage pain and breathing, become so flooded that the body''s automatic drive to breathe slows dramatically — or stops entirely.

**Types of Opioids**

Opioids include both prescription medications and illicit substances:

- **Prescription opioids**: oxycodone (OxyContin), hydrocodone (Vicodin), morphine, codeine, fentanyl patches
- **Heroin**: an illicit opioid derived from morphine
- **Illicitly manufactured fentanyl**: a synthetic opioid 50–100 times more potent than morphine, now found in counterfeit pills and mixed into heroin, cocaine, and other drugs

**Why Overdoses Happen**

Overdoses can occur when someone takes more than their body can handle. Common scenarios include:

- Taking a higher dose than usual
- Resuming use after a period of abstinence (tolerance drops quickly)
- Mixing opioids with alcohol, benzodiazepines, or other depressants
- Using drugs of unknown potency (especially with illicit fentanyl contamination)

**Risk Factors**

According to SAMHSA and the CDC, key risk factors include:

- History of substance use disorder
- Recent release from incarceration (tolerance resets during abstinence)
- Using alone, with no one to call for help
- History of previous overdose
- Concurrent use of multiple depressants
- Older age and certain medical conditions (sleep apnea, liver/kidney disease)

Understanding these risks is the first step toward prevention. Anyone who uses opioids — or knows someone who does — should be prepared to respond.',
  1,
  10
);

INSERT INTO quizzes (module_id, question, options, correct_index, explanation, points_reward)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'Which of the following is a major risk factor for opioid overdose?',
  '["Being physically active", "Resuming opioid use after a period of abstinence", "Drinking coffee with medication", "Taking opioids with food"]',
  1,
  'When someone stops using opioids — whether through treatment, incarceration, or personal choice — their tolerance drops rapidly. Resuming use at a previously tolerated dose can easily cause an overdose. This is why the period after release from incarceration is especially dangerous.',
  5
);

-- Module 1.2: Recognizing the Signs
INSERT INTO modules (id, course_id, title, content_markdown, sort_order, points_reward)
VALUES (
  'a2222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Recognizing the Signs',
  'Recognizing an overdose quickly is critical. The difference between life and death can be minutes. Opioid overdoses have distinct physical signs that anyone can learn to identify.

**The Key Signs of Opioid Overdose**

Look for the "opioid overdose triad":

1. **Pinpoint pupils** — The pupils become extremely small, even in dim light
2. **Unconsciousness or unresponsiveness** — The person cannot be woken up by voice or physical stimulation
3. **Respiratory depression** — Breathing is very slow (fewer than 8 breaths per minute), shallow, or has stopped entirely

**Additional Warning Signs**

- **Skin color changes**: Pale, blue, or grayish skin, especially around lips and fingertips (cyanosis)
- **Choking or gurgling sounds** ("death rattle") — caused by fluid in the airway
- **Limp body** — muscles completely relaxed, body feels heavy
- **Slow or absent pulse**
- **Vomiting** — especially dangerous in an unconscious person (aspiration risk)

**When to Act**

If you observe any combination of these signs, treat it as an overdose emergency:

- The person is unresponsive to a **sternal rub** (knuckles pressed firmly on the breastbone)
- Breathing is absent, very slow, or irregular
- Lips or fingertips are turning blue

**What This Is NOT**

Don''t confuse overdose with someone who is simply "nodding off." A person who is high but responsive — who answers to their name, adjusts their position, or reacts to stimulation — is not overdosing. The critical distinction is **unresponsiveness combined with breathing changes**.

Trust your instincts. If something looks wrong, it probably is. It is always better to respond and be wrong than to wait and lose someone.',
  2,
  10
);

INSERT INTO quizzes (module_id, question, options, correct_index, explanation, points_reward)
VALUES (
  'a2222222-2222-2222-2222-222222222222',
  'Which of the following is NOT a typical sign of an opioid overdose?',
  '["Pinpoint pupils", "Slow or stopped breathing", "Dilated (large) pupils", "Blue or gray skin color"]',
  2,
  'Dilated (large) pupils are associated with stimulant use, not opioid overdose. Opioid overdose is characterized by pinpoint (very small) pupils, slow or absent breathing, and bluish skin — the classic "opioid overdose triad." Recognizing these signs quickly can save a life.',
  5
);

-- Module 1.3: Good Samaritan Laws
INSERT INTO modules (id, course_id, title, content_markdown, sort_order, points_reward)
VALUES (
  'a3333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Good Samaritan Laws',
  'Fear of legal consequences is the #1 reason people hesitate to call 911 during an overdose. Good Samaritan laws exist to remove that barrier and save lives.

**What Good Samaritan Laws Do**

Most U.S. states (currently 47 states plus D.C.) have enacted some form of overdose Good Samaritan law. These laws generally provide:

- **Immunity from arrest and prosecution** for drug possession for the person who calls 911
- **Protection for the overdose victim** as well
- Coverage for possession of drug paraphernalia in many states

**What They Do NOT Protect**

Good Samaritan laws typically do NOT protect against:

- Drug distribution or trafficking charges
- Outstanding warrants
- Probation or parole violations (varies by state)
- Charges unrelated to simple possession

**State Variation**

Laws vary significantly by state. Some provide full criminal immunity, others only reduce charges or offer an affirmative defense. SSDP has been a leading advocate for strengthening these laws nationwide.

**SSDP''s Advocacy Role**

SSDP chapters have been instrumental in:

- Passing Good Samaritan laws on college campuses as official university policy
- Advocating for state-level legislation expanding protections
- Educating students about existing protections so they actually use them

**The Bottom Line**

**Always call 911.** Even in states with weaker protections, the risk of legal consequences is almost always less serious than the risk of someone dying. An overdose death is permanent. A possession charge is not.

Research from the Network for Public Health Law shows that states with Good Samaritan laws see increased rates of 911 calls during overdoses — and these calls save lives.',
  3,
  10
);

INSERT INTO quizzes (module_id, question, options, correct_index, explanation, points_reward)
VALUES (
  'a3333333-3333-3333-3333-333333333333',
  'Good Samaritan overdose laws typically protect callers from:',
  '["All criminal charges of any kind", "Drug possession charges related to the overdose scene", "Drug trafficking charges", "Probation violations in all states"]',
  1,
  'Good Samaritan laws specifically target the fear of drug possession charges that prevents people from calling 911 during an overdose. They generally provide immunity from simple possession charges for both the caller and the victim, but do not protect against trafficking charges, outstanding warrants, or (in most states) probation violations.',
  5
);

-- Module 1.4: Naloxone: How to Save a Life
INSERT INTO modules (id, course_id, title, content_markdown, sort_order, points_reward)
VALUES (
  'a4444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'Naloxone: How to Save a Life',
  'Naloxone (brand name Narcan) is a medication that rapidly reverses an opioid overdose. It is safe, effective, and available without a prescription in all 50 states.

**How Naloxone Works**

Naloxone is an "opioid antagonist" — it binds to the same brain receptors as opioids but blocks their effects. When administered during an overdose, it displaces the opioid molecules and restores normal breathing, usually within 2–5 minutes.

**Important**: Naloxone only works on opioids. It will not reverse overdoses from alcohol, benzodiazepines, stimulants, or other non-opioid drugs. However, it is safe to administer even if you''re unsure — it causes no harm to someone who hasn''t taken opioids.

**Forms of Naloxone**

- **Nasal spray (Narcan)**: A pre-filled nasal spray. No assembly required — insert into one nostril and press the plunger. This is the most common form.
- **Injectable (intramuscular)**: Draw naloxone from a vial into a syringe, inject into the outer thigh or upper arm. Used in some harm reduction kits.

**Step-by-Step Response**

1. **Call 911** immediately — naloxone is a temporary measure, not a replacement for emergency care
2. **Administer naloxone** — one spray in one nostril, or one intramuscular injection
3. **Perform rescue breathing** — tilt head back, lift chin, give one breath every 5 seconds
4. **Wait 2–3 minutes** — if no response, administer a second dose (fentanyl overdoses may require multiple doses)
5. **Place in recovery position** — on their side to prevent choking if they vomit
6. **Stay with them** — naloxone wears off in 30–90 minutes; the overdose can return

**Where to Get Naloxone**

- **Pharmacies**: Available over-the-counter nationwide (since 2023 FDA approval of OTC Narcan)
- **Harm reduction organizations**: Many distribute naloxone for free
- **SSDP chapters**: Many chapters distribute naloxone on campus
- **NEXT Distro** (nextdistro.org): Free naloxone shipped by mail

**A Note on Fentanyl**

Because fentanyl is significantly more potent than heroin or prescription opioids, fentanyl overdoses may require **multiple doses** of naloxone. Always carry at least two doses.',
  4,
  10
);

INSERT INTO quizzes (module_id, question, options, correct_index, explanation, points_reward)
VALUES (
  'a4444444-4444-4444-4444-444444444444',
  'What is the correct first step when you suspect someone is having an opioid overdose?',
  '["Administer naloxone immediately", "Call 911 first", "Give the person water", "Wait 10 minutes to see if they recover"]',
  1,
  'Always call 911 first. While naloxone is life-saving, it is a temporary measure — its effects wear off in 30–90 minutes, and the overdose can return. Professional emergency medical care is essential. After calling 911, administer naloxone, perform rescue breathing, and stay with the person.',
  5
);

-- Module 1.5: After an Overdose & Harm Reduction
INSERT INTO modules (id, course_id, title, content_markdown, sort_order, points_reward)
VALUES (
  'a5555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  'After an Overdose & Harm Reduction',
  'Surviving an overdose is not the end of the story. What happens next — both immediately and in the weeks that follow — can determine whether someone stays safe or faces another crisis.

**Immediately After Reversal**

When naloxone takes effect, the person may:

- Wake up confused, agitated, or experiencing withdrawal symptoms
- Not remember what happened
- Want to leave the scene — gently explain what happened and encourage them to wait for EMS

**Important**: The opioid may outlast the naloxone. This means the person can go back into overdose after the naloxone wears off (30–90 minutes). **Never leave someone alone after administering naloxone.**

**Connecting to Resources**

An overdose is often a turning point. Without judgment or pressure, you can:

- Offer information about treatment options (if the person is interested)
- Connect them with harm reduction services
- Help them get naloxone to carry
- Provide fentanyl test strips for future use
- Share the SAMHSA helpline: 1-800-662-4357

**The Harm Reduction Philosophy**

Harm reduction is SSDP''s foundational framework. It is a set of practical strategies aimed at reducing the negative consequences of drug use — without requiring abstinence as a precondition.

Core principles:

- **Meets people where they are** — no judgment, no preconditions
- **Recognizes that drug use is a complex reality** — abstinence-only approaches leave out the people most at risk
- **Prioritizes keeping people alive and healthy** — you can''t recover if you''re dead
- **Addresses conditions of use, not just use itself** — poverty, criminalization, and stigma increase harm

**Campus Advocacy**

As SSDP members, you can advocate for overdose prevention on your campus:

- Push for naloxone availability in dorms and campus health centers
- Organize HOPE trainings for fellow students
- Advocate for campus Good Samaritan policies
- Distribute fentanyl test strips
- Challenge stigma in campus conversations about drug use

**You Are Now Equipped**

By completing this training, you have the knowledge to save a life. Carry naloxone. Know the signs. Call 911. Be the person who acts.',
  5,
  10
);

INSERT INTO quizzes (module_id, question, options, correct_index, explanation, points_reward)
VALUES (
  'a5555555-5555-5555-5555-555555555555',
  'Which statement best describes the harm reduction approach?',
  '["Drug use must stop completely before any help can be offered", "Practical strategies to reduce negative consequences of drug use without requiring abstinence", "Harm reduction means encouraging drug use", "Only medical professionals can practice harm reduction"]',
  1,
  'Harm reduction is a set of practical, evidence-based strategies that aim to reduce the negative consequences of drug use. It meets people where they are, prioritizes keeping people alive and healthy, and does not require abstinence as a precondition for support. Anyone can practice harm reduction — including you.',
  5
);


-- ============================================
-- COURSE 2: THR — Tobacco Harm Reduction
-- ============================================

INSERT INTO courses (id, title, description, track, duration_minutes, module_count, required_role, sort_order, is_published, partner_name, points_bonus)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Tobacco Harm Reduction',
  'Understand the science and policy of tobacco harm reduction. Learn about the continuum of risk, global perspectives, and how to advocate for evidence-based nicotine policy.',
  'drug_education',
  45,
  4,
  'registered',
  2,
  true,
  'SSDP THR Initiative',
  20
);

-- Module 2.1: What is Tobacco Harm Reduction
INSERT INTO modules (id, course_id, title, content_markdown, sort_order, points_reward)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'What is Tobacco Harm Reduction',
  'Tobacco harm reduction (THR) is the strategy of encouraging smokers who cannot or choose not to quit nicotine to switch to significantly less harmful alternatives. It applies the same evidence-based harm reduction philosophy that SSDP champions across all drug policy.

**The Scale of the Problem**

Cigarette smoking remains the leading cause of preventable death in the United States:

- **480,000 Americans die annually** from smoking-related diseases (CDC)
- **Globally, 8 million deaths per year** are attributed to tobacco (WHO)
- Smoking causes cancer, heart disease, stroke, lung diseases, diabetes, and COPD

**It''s the Smoke, Not the Nicotine**

This is the critical insight behind THR: **the vast majority of harm from tobacco comes from combustion** — burning tobacco and inhaling the resulting smoke, which contains over 7,000 chemicals, at least 70 of which cause cancer.

Nicotine, while addictive, is not the primary driver of smoking-related disease. As the UK Royal College of Physicians stated: *"Nicotine itself is not especially hazardous... If nicotine could be delivered effectively and acceptably to smokers without smoke, most of the harm would be avoided."*

**SSDP''s Evidence-Based Approach**

SSDP supports THR because the evidence supports it. Just as we advocate for harm reduction in other drug policy areas, we believe:

- People who use nicotine deserve access to accurate, non-stigmatizing information
- Policy should be guided by science, not moral panic
- Reducing harm is a legitimate and valuable goal, even when elimination of use isn''t achieved
- Adults should have access to less harmful alternatives

THR is not about promoting nicotine use. It is about ensuring that the hundreds of millions of people worldwide who currently smoke have access to — and accurate information about — products that could save their lives.',
  1,
  10
);

INSERT INTO quizzes (module_id, question, options, correct_index, explanation, points_reward)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'What is the primary driver of tobacco-related disease?',
  '["Nicotine itself", "The combustion of tobacco (smoke)", "The paper wrapping of cigarettes", "The addictive properties of tobacco"]',
  1,
  'The vast majority of harm from tobacco comes from combustion — the process of burning tobacco and inhaling smoke containing over 7,000 chemicals. Nicotine, while addictive, is not the primary cause of smoking-related diseases like cancer, heart disease, and COPD. This is why switching from combustible cigarettes to smoke-free alternatives can dramatically reduce health risks.',
  5
);

-- Module 2.2: The Continuum of Risk
INSERT INTO modules (id, course_id, title, content_markdown, sort_order, points_reward)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'The Continuum of Risk',
  'Not all nicotine products carry the same risk. Understanding the continuum of risk is essential for informed harm reduction advocacy.

**The Risk Spectrum (Highest to Lowest)**

1. **Combustible cigarettes** — The most harmful. Burning tobacco produces thousands of toxicants. Responsible for the overwhelming majority of tobacco-related death and disease.

2. **Heated tobacco products (HTPs)** — Devices like IQOS heat tobacco without burning it. Significantly fewer toxicants than cigarettes. FDA authorized IQOS with "modified risk" claims for reduced exposure.

3. **E-cigarettes / Vaping** — Battery-powered devices that heat a liquid (usually containing nicotine, propylene glycol, vegetable glycerin, and flavorings) into an aerosol. Public Health England estimated vaping is **at least 95% less harmful** than smoking. No combustion = no smoke.

4. **Nicotine pouches and snus** — Oral products placed between the lip and gum. Swedish snus has decades of epidemiological data showing dramatically lower cancer and cardiovascular risk compared to cigarettes. Sweden has the lowest male smoking rate in Europe AND the lowest rate of tobacco-related disease.

5. **Nicotine Replacement Therapy (NRT)** — Patches, gums, lozenges. FDA-approved for cessation. Very low risk. Also the least effective at helping smokers switch, partly because they don''t replicate the behavioral aspects of smoking.

**Key Evidence**

- **Sweden''s natural experiment**: Sweden has the lowest male smoking rate in the EU (~5%) largely due to widespread snus use. Swedish men have the lowest rates of lung cancer and tobacco-related mortality in Europe.
- **UK public health approach**: The UK actively promotes vaping as a cessation tool. Public Health England (now OHID) has consistently affirmed that vaping is far less harmful than smoking.
- **FDA framework**: The FDA''s Center for Tobacco Products uses a "continuum of risk" framework, recognizing that different products pose different levels of risk.

**Why This Matters for Policy**

When regulations treat all nicotine products the same — banning flavored vapes while leaving menthol cigarettes on shelves, for example — they can inadvertently push people toward the most harmful option. Evidence-based policy should reflect the actual risk differences between products.',
  2,
  10
);

INSERT INTO quizzes (module_id, question, options, correct_index, explanation, points_reward)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  'Rank these products from MOST to LEAST harmful:',
  '["Cigarettes > Vaping > Nicotine pouches > NRT patches", "Vaping > Cigarettes > NRT patches > Nicotine pouches", "NRT patches > Nicotine pouches > Vaping > Cigarettes", "Nicotine pouches > Cigarettes > Vaping > NRT patches"]',
  0,
  'The continuum of risk, supported by organizations like Public Health England and the FDA, ranks combustible cigarettes as the most harmful, followed by heated tobacco products, then e-cigarettes/vaping, then oral products like snus and nicotine pouches, with NRT (patches, gum, lozenges) at the lowest risk. The key factor is combustion — products that burn tobacco are far more dangerous.',
  5
);

-- Module 2.3: Global Perspectives & Policy
INSERT INTO modules (id, course_id, title, content_markdown, sort_order, points_reward)
VALUES (
  'b3333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'Global Perspectives & Policy',
  'Countries around the world have taken dramatically different approaches to tobacco harm reduction — and the results speak for themselves.

**The UK: A Global Leader**

The UK''s National Health Service (NHS) actively **recommends** e-cigarettes to help smokers quit. The UK government has:

- Endorsed vaping as significantly less harmful than smoking since 2015
- Made vapes available by prescription
- Set a goal to be "smoke-free" (below 5% smoking prevalence) by 2030
- Maintained regulations that ensure product safety while keeping vaping accessible

Result: UK smoking rates have fallen to historic lows, with vaping playing a documented role.

**Sweden: The Snus Success Story**

Sweden offers perhaps the most compelling natural experiment in THR:

- Male smoking rate: ~5% (EU average: ~25%)
- Male tobacco-related mortality: the lowest in Europe
- The difference? Widespread use of snus, an oral tobacco product
- Sweden is on track to become the first "smoke-free" country in Europe

**New Zealand**

New Zealand adopted a progressive approach, explicitly endorsing vaping as a cessation tool and regulating it separately from cigarettes.

**The WHO Position**

The WHO has been more cautious, expressing concerns about youth uptake and dual use. SSDP respects the global health perspective while noting that the WHO''s framework has been criticized by prominent public health researchers (including former WHO consultants) for not adequately weighing the potential of THR to save lives.

**U.S. Flavor Bans and PMTA**

In the U.S., the regulatory landscape is complex:

- The FDA requires Premarket Tobacco Product Applications (PMTA) for all vaping products
- Several states and cities have banned flavored vaping products
- Critics argue these bans push adult smokers back to cigarettes while doing little to prevent youth initiation
- SSDP advocates for evidence-based regulation that accounts for both youth protection AND adult smoker access to less harmful alternatives

**The Policy Challenge**

Good tobacco harm reduction policy must balance:
- Preventing youth initiation (important)
- Helping adult smokers switch to less harmful products (also important)
- Avoiding policies that inadvertently protect the cigarette market',
  3,
  10
);

INSERT INTO quizzes (module_id, question, options, correct_index, explanation, points_reward)
VALUES (
  'b3333333-3333-3333-3333-333333333333',
  'Which country actively promotes vaping as a smoking cessation tool through its national health service?',
  '["United States", "Australia", "United Kingdom", "Japan"]',
  2,
  'The United Kingdom has been a global leader in tobacco harm reduction. The UK''s NHS actively recommends e-cigarettes to help smokers quit, and Public Health England (now OHID) has consistently stated that vaping is at least 95% less harmful than smoking. The UK approach prioritizes helping current smokers access less harmful alternatives.',
  5
);

-- Module 2.4: Advocacy & SSDP's Role
INSERT INTO modules (id, course_id, title, content_markdown, sort_order, points_reward)
VALUES (
  'b4444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  'Advocacy & SSDP''s Role',
  'As SSDP members, you are uniquely positioned to advocate for evidence-based nicotine policy on your campus and in your community.

**SSDP''s THR Policy Recommendations**

SSDP advocates for:

1. **Proportional regulation** — Policies should reflect actual risk. Vaping products should not be regulated identically to combustible cigarettes.
2. **Maintaining adult access** — Flavor bans and excessive taxation can push adult smokers back to cigarettes.
3. **Youth prevention through education, not prohibition** — Evidence shows that prohibition-based approaches often backfire.
4. **Support for switching** — Health systems should actively support smokers who want to switch to less harmful alternatives.
5. **Research funding** — Long-term studies on reduced-risk products should be funded, not blocked.

**Countering Misinformation**

THR advocates frequently encounter misinformation. Here are evidence-based responses to common claims:

**"Vaping is just as bad as smoking"**
→ False. Every major public health body that has reviewed the evidence (PHE, NAS, FDA) has concluded that vaping is significantly less harmful than smoking. Not risk-free, but dramatically less harmful.

**"Vaping is a gateway to smoking"**
→ The data doesn''t support this. Youth smoking rates have continued to fall even as youth vaping rates rose and then fell. In countries like the UK, where vaping is promoted for adults, youth smoking has declined faster.

**"We don''t know the long-term effects"**
→ While long-term data is still accumulating, we have decades of data on snus and years of data on vaping showing dramatically fewer toxicants. We also know with certainty what cigarettes do: they kill half of long-term users.

**Campus Advocacy Actions**

- Organize THR educational events featuring harm reduction researchers
- Advocate against campus-wide nicotine bans that don''t distinguish between combustible and non-combustible products
- Distribute accurate information about the continuum of risk
- Attend the annual Conference on Nicotine Harm Reduction
- Write op-eds for campus newspapers presenting evidence-based perspectives
- Engage with student government on nicotine policy proposals

**The Conference Connection**

SSDP participates in major THR conferences to stay current on the science and connect with researchers, clinicians, and advocates. These connections strengthen our campus advocacy.',
  4,
  10
);

INSERT INTO quizzes (module_id, question, options, correct_index, explanation, points_reward)
VALUES (
  'b4444444-4444-4444-4444-444444444444',
  'What is the most effective advocacy strategy for tobacco harm reduction?',
  '["Banning all nicotine products on campus", "Promoting evidence-based information about the continuum of risk", "Telling people to just stop using nicotine", "Ignoring the issue entirely"]',
  1,
  'Effective THR advocacy centers on providing evidence-based information about the continuum of risk. This means helping people understand that while no nicotine product is risk-free, the differences in harm between products are enormous. Blanket bans and abstinence-only messaging fail to reach the people most at risk.',
  5
);


-- ============================================
-- COURSE 3: Become an SSDP Ambassador
-- ============================================

INSERT INTO courses (id, title, description, track, duration_minutes, module_count, required_role, sort_order, is_published, points_bonus)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Become an SSDP Ambassador',
  'Learn what it means to be an SSDP Ambassador, how the points system works, and sign the Ambassador Agreement to unlock exclusive features and represent SSDP in your community.',
  'internal_onboarding',
  20,
  3,
  'registered',
  3,
  true,
  25
);

-- Module 3.1: What is an Ambassador
INSERT INTO modules (id, course_id, title, content_markdown, sort_order, points_reward)
VALUES (
  'c1111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  'What is an Ambassador',
  'An SSDP Ambassador is a trained, committed advocate for sensible drug policy who represents SSDP''s mission in their community, campus, and beyond.

**The Ambassador Role**

As an Ambassador, you are the face of SSDP. You:

- **Represent SSDP** at campus events, conferences, and community meetings
- **Educate peers** about evidence-based drug policy and harm reduction
- **Lead advocacy efforts** on your campus — from Good Samaritan policies to harm reduction programming
- **Connect with the network** — communicate with other Ambassadors, share strategies, and coordinate campaigns

**What You Unlock**

Becoming an Ambassador gives you access to:

- **Ambassador-only chat channels** — Connect with fellow Ambassadors nationwide
- **Advanced training courses** — Deeper dives into policy advocacy, media training, and leadership
- **Priority access** to SSDP conferences and events
- **SSDP Ambassador badge** — Visible on your profile within the app
- **Leadership opportunities** — Ambassadors are first in line for committee roles and board nominations

**What We Expect**

Being an Ambassador is a privilege and a responsibility. We expect:

- Active engagement in at least one SSDP campaign or activity per semester
- Respectful, evidence-based communication in all SSDP interactions
- Adherence to SSDP''s code of conduct
- Willingness to learn and grow as an advocate

**Who Can Become an Ambassador**

Any registered SSDP member can become an Ambassador by:

1. Completing this Ambassador training course
2. Signing the Ambassador Agreement (at the end of this course)
3. Receiving approval from SSDP staff

The process is designed to be accessible while ensuring that Ambassadors understand and commit to SSDP''s mission and values.',
  1,
  10
);

-- Module 3.2: The Points System
INSERT INTO modules (id, course_id, title, content_markdown, sort_order, points_reward)
VALUES (
  'c2222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  'The Points System',
  'SSDP''s points system recognizes and rewards engagement. Points track your contributions and your chapter''s collective impact.

**How Points Work**

You earn points for meaningful actions within the SSDP community:

| Action | Points |
|--------|--------|
| Complete a course module | 10 pts |
| Answer a quiz correctly | 5 pts |
| Complete a full course | 20 pts bonus |
| Respond to an Action Alert | 25 pts |
| Submit an Activity Report | 10 pts |
| Attend a Lobby Day event | 50 pts |

**Individual vs. Chapter Points**

- **Your personal points** reflect your own engagement and unlock recognition
- **Chapter points** are the sum of all members'' points — chapters compete for recognition at the annual SSDP conference

**What Points Get You**

Points are primarily a measure of engagement and commitment. They:

- Appear on your profile
- Contribute to your chapter''s ranking
- Are recognized at SSDP conferences and events
- Help SSDP leadership identify active, engaged members for leadership opportunities

**Chapter Competition**

Each semester, chapters with the most collective points are recognized. This friendly competition encourages:

- Active participation across the chapter, not just from a few leaders
- Engagement with training content, which improves advocacy quality
- Consistent activity throughout the semester

**Tips for Earning Points**

- Complete all available courses (HOPE, THR, and more as they launch)
- Respond to Action Alerts when they come through
- File Activity Reports for events and meetings
- Encourage your chapter members to participate — your collective effort adds up',
  2,
  10
);

-- Module 3.3: Your Commitment (Ambassador Agreement)
INSERT INTO modules (id, course_id, title, content_markdown, sort_order, points_reward)
VALUES (
  'c3333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  'Your Commitment',
  'You''re ready for the final step: signing the SSDP Ambassador Agreement.

**What You''re Committing To**

By signing the Ambassador Agreement, you pledge to:

1. **Represent SSDP with integrity** — In all interactions, online and offline, you carry SSDP''s reputation. Represent the organization with honesty, respect, and professionalism.

2. **Engage in evidence-based conversations** — Our advocacy is grounded in science, public health research, and human rights principles. Avoid unsubstantiated claims and always be willing to cite sources.

3. **Participate actively** — Commit to at least one SSDP campaign, event, or activity per semester. Consistent engagement is what makes our network powerful.

4. **Support harm reduction** — Embody harm reduction principles in your advocacy and your interactions with others. Meet people where they are, without judgment.

5. **Stay informed** — Drug policy is constantly evolving. Stay current on issues through SSDP resources, news alerts, and training courses.

6. **Mentor others** — Help new SSDP members get involved. Share your knowledge and experience.

7. **Follow the code of conduct** — SSDP''s code of conduct ensures a safe, respectful, and inclusive environment for all members.

**What Happens After You Sign**

1. Your agreement is submitted to SSDP staff for review
2. Upon approval, your role is upgraded to **Ambassador**
3. You immediately gain access to Ambassador-only features
4. You''ll receive a welcome notification with next steps

**Ready?**

When you complete this module, you''ll be presented with the Ambassador Agreement to review and sign. Take your time, read each commitment carefully, and sign when you''re ready.

Welcome to the next level of your SSDP journey.',
  3,
  10
);


-- ============================================
-- SEED: Default Chat Channels
-- ============================================

INSERT INTO chat_channels (name, description, required_role, sort_order)
VALUES
  ('General', 'Open discussion for all SSDP members', 'registered', 1),
  ('Drug Policy News', 'Share and discuss drug policy developments', 'registered', 2),
  ('Ambassador Lounge', 'Exclusive channel for SSDP Ambassadors', 'ambassador', 3),
  ('Campaign Coordination', 'Plan and coordinate advocacy campaigns', 'ambassador', 4),
  ('Staff Announcements', 'Official updates from SSDP staff', 'registered', 5);


-- ============================================
-- SEED: Default Menu Items
-- ============================================

INSERT INTO menu_items (label, icon, link_type, link_value, required_role, section, sort_order, is_visible)
VALUES
  ('SSDP Website', 'globe', 'external', 'https://ssdp.org', 'guest', 'ssdp', 1, true),
  ('Donate', 'heart', 'external', 'https://ssdp.org/donate', 'guest', 'ssdp', 2, true),
  ('SSDP Blog', 'newspaper-o', 'external', 'https://ssdp.org/blog', 'guest', 'ssdp', 3, true),
  ('Contact Support', 'envelope', 'external', 'https://ssdp.org/contact', 'guest', 'support', 1, true),
  ('Privacy Policy', 'shield', 'external', 'https://ssdp.org/app-privacy', 'guest', 'support', 2, true),
  ('About SSDP', 'info-circle', 'external', 'https://ssdp.org/about', 'guest', 'support', 3, true);
