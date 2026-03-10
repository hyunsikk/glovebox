import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, Shared } from '../../theme';

const knowledgeBase = {
  categories: [
    {
      id: 'engine',
      title: 'Engine Care',
      icon: 'car-cog',
      emoji: '🛢️',
      color: Colors.steelBlue,
      articles: [
        {
          title: 'Oil Change Intervals',
          content: 'Modern synthetic oils can safely go 7,500-10,000 miles between changes for most vehicles. Older cars running conventional oil should stick to 3,000-5,000 miles. Always check your owner\'s manual — manufacturer recommendations trump generic advice. Turbocharged engines may have shorter intervals due to higher oil temperatures.',
          tips: [
            'Use the oil grade specified in your owner\'s manual (e.g. 0W-20, 5W-30)',
            'Severe driving conditions (towing, dusty roads, short trips) may require shorter intervals',
            'Dark oil doesn\'t always mean it needs changing — modern detergent oils darken quickly',
            'Full synthetic costs more but lasts 2-3x longer than conventional',
            'Keep receipts — documented oil change history boosts resale value',
          ]
        },
        {
          title: 'Air Filter Maintenance',
          content: 'Your engine breathes through its air filter. A clean filter ensures optimal fuel-to-air ratio, improving power and fuel economy. Most filters should be replaced every 12,000-15,000 miles, but dusty environments or unpaved roads can cut that in half.',
          tips: [
            'Check filter condition every oil change — hold it up to light, if you can\'t see through it, replace it',
            'Replace more frequently if you drive on dirt/gravel roads',
            'A clogged filter can reduce acceleration by up to 10%',
            'OEM filters are fine — don\'t overspend on "performance" filters for daily drivers',
            'Some reusable filters (K&N) can be washed and re-oiled instead of replaced',
          ]
        },
        {
          title: 'Spark Plug Replacement',
          content: 'Spark plugs ignite the fuel-air mixture in your engine. Worn plugs cause misfires, poor fuel economy, and rough idle. Copper plugs last 20,000-30,000 miles, while iridium and platinum plugs can go 60,000-100,000+ miles.',
          tips: [
            'Use the exact plug type specified by your manufacturer — don\'t upgrade or downgrade',
            'Misfires, rough idle, or poor acceleration often point to worn plugs',
            'Always replace plugs as a complete set — never just one or two',
            'Apply anti-seize compound to threads to prevent future removal issues',
            'Gap the plugs to spec if they\'re not pre-gapped from the box',
          ]
        },
        {
          title: 'Timing Belt vs Timing Chain',
          content: 'The timing belt/chain synchronizes your engine\'s valves and pistons. Belts are rubber and need periodic replacement (typically 60,000-100,000 miles). Chains are metal and usually last the life of the engine, but can stretch over time. A failed timing belt on an interference engine will cause catastrophic valve damage.',
          tips: [
            'Check if your car has a belt or chain — this is critical knowledge for maintenance planning',
            'Timing belt replacement is expensive ($500-1,500) but skipping it risks engine destruction',
            'Replace the water pump at the same time as the timing belt — it\'s behind the belt anyway',
            'Timing chain stretch symptoms: rattling noise on cold start, check engine light, rough idle',
            'Common belt cars: Honda Accord (V6), older Subarus, many 4-cylinder Toyotas pre-2010',
          ]
        },
        {
          title: 'Understanding Check Engine Light',
          content: 'The check engine light (CEL) can mean anything from a loose gas cap to a serious engine problem. A solid light usually indicates a non-urgent issue. A flashing light means pull over immediately — you risk catalytic converter damage or worse.',
          tips: [
            'A $20 OBD-II scanner can read the code yourself — most auto parts stores do it free',
            'Common codes: P0420 (catalytic converter), P0171/P0174 (lean condition), P0300 (random misfire)',
            'Tighten your gas cap first — it\'s the #1 reason for CEL on newer cars',
            'Don\'t ignore it for long — small problems become expensive ones',
            'After fixing the issue, the light may take a few drive cycles to clear on its own',
          ]
        },
        {
          title: 'Engine Coolant Temperature',
          content: 'Your engine operates best between 195-220°F. Running too hot causes warping and gasket failure. Running too cold wastes fuel and increases wear. The thermostat regulates this range, and a faulty one is a common and cheap fix.',
          tips: [
            'If the temp gauge goes past 3/4, pull over and let it cool — overheating kills engines',
            'A stuck-open thermostat causes slow warm-up and poor heater performance',
            'A stuck-closed thermostat causes rapid overheating — replace immediately',
            'Electric fans should kick on around 200-210°F — if they don\'t, check the relay and sensor',
            'Low coolant level is the most common cause of overheating — check it monthly',
          ]
        },
        {
          title: 'Carbon Buildup in Direct Injection',
          content: 'Direct injection (DI) engines spray fuel directly into the cylinder, bypassing the intake valves. Without fuel washing over them, valves accumulate carbon deposits over time. This is common on GDI engines from BMW, VW/Audi, Ford EcoBoost, Hyundai/Kia, and many others after 50,000+ miles.',
          tips: [
            'Symptoms: rough idle, misfires, reduced power, poor fuel economy',
            'Walnut blasting is the most effective cleaning method ($300-600 at a shop)',
            'Some manufacturers added port injection alongside DI to combat this (Toyota D-4S, Ford\'s latest)',
            'Catch cans can help reduce buildup but won\'t eliminate it entirely',
            'Italian tune-up: occasional spirited driving can help burn off minor deposits',
          ]
        },
      ]
    },
    {
      id: 'brakes',
      title: 'Brake System',
      icon: 'car-brake-alert',
      emoji: '🛑',
      color: Colors.deepRed,
      articles: [
        {
          title: 'Brake Pad Replacement',
          content: 'Brake pads are the #1 wear item on any vehicle. They typically last 30,000-70,000 miles depending on driving style, pad material, and vehicle weight. City driving wears pads faster due to constant stop-and-go.',
          tips: [
            'Squealing usually means pads are getting thin — the wear indicator tab is touching the rotor',
            'Grinding metal-on-metal means pads are gone — you\'re now damaging rotors too',
            'Highway driving is much easier on brakes than city driving',
            'Ceramic pads are quieter and produce less dust, semi-metallic pads have better stopping power',
            'Heavy vehicles (trucks, SUVs) eat through pads faster — budget accordingly',
          ]
        },
        {
          title: 'Brake Fluid Service',
          content: 'Brake fluid is hygroscopic — it absorbs moisture from the air over time. Contaminated fluid has a lower boiling point, which can cause brake fade during hard braking (the pedal goes spongy). Most manufacturers recommend replacement every 2-3 years.',
          tips: [
            'DOT 3 and DOT 4 are the most common types — check your cap or manual',
            'Old fluid can cause internal corrosion of brake lines and calipers',
            'If the pedal feels spongy, you may have air in the lines — bleeding is needed',
            'Never let brake fluid reservoir run dry — air in the system is dangerous',
            'Flush during pad replacement to save on labor costs',
          ]
        },
        {
          title: 'Rotor Inspection and Replacement',
          content: 'Brake rotors are the discs your pads clamp against. They can warp from heat, develop grooves from worn pads, or wear below minimum thickness. Warped rotors cause pulsation in the brake pedal.',
          tips: [
            'Pulsating brake pedal = warped rotors — resurfacing or replacement needed',
            'Deep grooves or scoring mean the rotor needs replacement, not just resurfacing',
            'Always replace rotors in pairs (both front or both rear) for even braking',
            'Minimum thickness is stamped on the rotor — measure with a micrometer',
            'Cheap rotors may warp faster — mid-range brands like Centric or StopTech are good value',
          ]
        },
        {
          title: 'ABS System Basics',
          content: 'Anti-lock Braking System (ABS) prevents wheel lockup during hard braking by rapidly pulsing the brakes. If your ABS light comes on, your regular brakes still work but without the anti-lock protection. Common issues include faulty wheel speed sensors and corroded tone rings.',
          tips: [
            'ABS light on ≠ no brakes — it means the anti-lock system is disabled',
            'Wheel speed sensors are the most common ABS failure point ($50-150 per sensor)',
            'Dirty or damaged tone rings on the axle can trigger false ABS activation',
            'ABS pulsation in the pedal during hard stops is normal — don\'t release pressure',
            'Most ABS issues throw specific codes readable with an OBD-II scanner',
          ]
        },
        {
          title: 'Emergency Brake Maintenance',
          content: 'The parking/emergency brake uses cables or an electric actuator to hold the rear brakes. Cable-operated systems can seize from lack of use, especially in rust-prone areas. Use it regularly to keep it functional — it\'s not just for hills.',
          tips: [
            'Use your parking brake regularly — even on flat ground — to prevent cables from seizing',
            'Adjust cables periodically — a loose e-brake is useless in an emergency',
            'Electronic parking brakes (common post-2015) have their own service procedures',
            'If the brake feels loose or the car rolls, have cables inspected immediately',
            'In winter, avoid setting the e-brake if ice could freeze the cables engaged',
          ]
        },
      ]
    },
    {
      id: 'tires',
      title: 'Tire Care',
      icon: 'tire',
      emoji: '🛞',
      color: Colors.amberAlert,
      articles: [
        {
          title: 'Tire Rotation Patterns',
          content: 'Tires wear unevenly depending on their position. Front tires wear faster on FWD cars due to steering and driving forces. Regular rotation every 5,000-7,500 miles ensures even wear and can double tire life.',
          tips: [
            'Front-wheel drive: front tires go straight to rear, rear cross to front',
            'Rear-wheel drive: rear tires go straight to front, front cross to rear',
            'All-wheel drive: X-pattern (cross all four) or follow manufacturer instructions',
            'Directional tires can only swap front-to-back on the same side',
            'Staggered setups (different front/rear sizes) cannot be rotated — they just wear',
          ]
        },
        {
          title: 'Proper Tire Pressure',
          content: 'Correct tire pressure affects fuel economy, handling, tire life, and safety. Under-inflated tires wear the edges, waste fuel, and can overheat. Over-inflated tires wear the center and reduce grip. Check monthly when tires are cold (before driving).',
          tips: [
            'Correct pressure is on the door jamb sticker, NOT the tire sidewall (that\'s the max)',
            'Pressure drops ~1 PSI per 10°F temperature drop — check more in fall/winter',
            'TPMS light comes on at 25% below recommended — that\'s already significantly low',
            'A $5 digital gauge is more accurate than gas station gauges',
            'Nitrogen fill holds pressure longer but isn\'t worth paying extra for most people',
          ]
        },
        {
          title: 'Reading Tire Wear Patterns',
          content: 'Your tire wear tells a story about your car\'s alignment, inflation, and suspension health. Learning to read wear patterns can catch problems early before they destroy an expensive set of tires.',
          tips: [
            'Both edges worn = under-inflation — add air and check for slow leaks',
            'Center worn = over-inflation — let some air out',
            'One edge worn = alignment off — get an alignment before buying new tires',
            'Cupping/scalloping = bad shocks/struts — bouncy ride confirms this',
            'Feathering (smooth one way, rough the other) = toe alignment issue',
          ]
        },
        {
          title: 'When to Replace Tires',
          content: 'Tires should be replaced when tread depth reaches 2/32" (the legal minimum) or 4/32" for rain safety. Even with good tread, tires older than 6-10 years should be replaced — rubber degrades with age regardless of use.',
          tips: [
            'The penny test: insert a penny head-down into the groove — if you see Lincoln\'s whole head, replace',
            'The quarter test is safer: 4/32" gives much better wet traction than 2/32"',
            'Check the DOT date code on sidewall — last 4 digits = week and year of manufacture (e.g. 2521 = week 25, 2021)',
            'Tires over 6 years old start losing grip even if they look fine — rubber hardens',
            'Buy all 4 at once if possible — mismatched tires hurt AWD systems',
          ]
        },
        {
          title: 'Wheel Alignment Explained',
          content: 'Alignment adjusts three angles: camber (tire lean), toe (tire direction), and caster (steering axis tilt). Misalignment causes uneven tire wear, pulling, and wandering. Get an alignment after hitting a major pothole, replacing tires, or any suspension work.',
          tips: [
            'Pulling to one side is the classic alignment symptom — but road crown can mimic this',
            'A proper 4-wheel alignment costs $80-150 and takes 30-60 minutes',
            'Lowered or lifted vehicles need alignment specs adjusted for the new ride height',
            'Worn suspension components (tie rods, ball joints) must be replaced BEFORE alignment',
            'Most shops offer lifetime alignment packages ($200-300) — worth it if you keep the car 3+ years',
          ]
        },
        {
          title: 'All-Season vs Winter vs Summer Tires',
          content: 'All-season tires are a compromise — they\'re adequate in most conditions but excel in none. Winter tires use softer rubber compounds that stay pliable below 45°F, dramatically improving grip on cold, wet, and snowy roads. Summer tires offer the best dry and wet grip but become dangerous below 40°F.',
          tips: [
            'If it regularly drops below 45°F where you live, a set of winter tires is a safety investment',
            'Winter tires on a separate set of cheap steel wheels makes seasonal swaps easy',
            'All-weather tires (Michelin CrossClimate, etc.) are a good middle ground for mild winters',
            'Summer tires on snow/ice is genuinely dangerous — they\'re rock-hard in cold weather',
            'Store off-season tires in a cool, dark place away from ozone sources (electric motors)',
          ]
        },
      ]
    },
    {
      id: 'transmission',
      title: 'Transmission',
      icon: 'car-shift-pattern',
      emoji: '⚙️',
      color: Colors.warmCopper,
      articles: [
        {
          title: 'Automatic Transmission Service',
          content: 'Traditional automatics use planetary gearsets and torque converters. Fluid degrades over time from heat and friction. Most manufacturers recommend fluid changes every 60,000-100,000 miles, though some claim "lifetime fluid" — which often means the fluid outlasts the warranty, not the transmission.',
          tips: [
            'Use ONLY manufacturer-specified fluid — wrong ATF can destroy a transmission',
            '"Lifetime" fluid is marketing — changing at 60K-80K extends transmission life significantly',
            'Burnt smell or dark brown/black fluid means service is overdue',
            'Harsh or delayed shifts are early signs of fluid degradation',
            'A full flush is debated — many mechanics prefer a drain-and-fill (exchanges ~40% of fluid)',
          ]
        },
        {
          title: 'CVT Transmission Care',
          content: 'Continuously Variable Transmissions (CVTs) use a belt and pulleys instead of gears. They\'re more fuel-efficient but require specific CVT fluid and can be sensitive to maintenance neglect. Common in Nissan, Subaru, Honda, and Toyota vehicles.',
          tips: [
            'CVT fluid is NOT the same as regular ATF — never substitute',
            'Nissan CVTs (Jatco) are notorious for issues — stay on top of fluid changes (every 30K-60K)',
            'Subaru CVTs are more robust but still need fluid service per the maintenance schedule',
            'Shuddering or jerking during acceleration is a common CVT warning sign',
            'Avoid aggressive launches and towing — CVTs handle high torque poorly',
          ]
        },
        {
          title: 'Manual Transmission Care',
          content: 'Manuals are simpler and more durable than automatics, but they\'re not maintenance-free. Gear oil should be changed every 30,000-60,000 miles. The clutch is a wear item that lasts 60,000-150,000+ miles depending on driving style.',
          tips: [
            'Hard shifting when cold often improves as gear oil warms up — if not, it\'s due for a change',
            'Don\'t rest your foot on the clutch pedal — even light pressure causes wear',
            'Don\'t rest your hand on the shifter — it puts pressure on selector forks',
            'Rev-matching (blipping throttle on downshifts) extends clutch and synchro life',
            'Clutch replacement is $800-2,500 depending on the car — labor is most of the cost',
          ]
        },
        {
          title: 'Dual-Clutch Transmission (DCT)',
          content: 'DCTs use two clutches for lightning-fast shifts — one for odd gears, one for even. Found in VW/Audi (DSG), BMW, Ford (PowerShift), Hyundai/Kia. They\'re efficient and fast but can be jerky at low speeds and require specific maintenance.',
          tips: [
            'VW/Audi DSG requires fluid and filter change every 40,000 miles — don\'t skip it',
            'Low-speed jerkiness is normal for dry-clutch DCTs — it\'s a design characteristic',
            'Ford PowerShift (Focus/Fiesta 2012-2016) had major reliability issues — research before buying',
            'Wet-clutch DCTs (DSG, Hyundai 8DCT) are more reliable than dry-clutch versions',
            'Avoid heavy stop-and-go traffic if possible — DCTs prefer flowing driving conditions',
          ]
        },
        {
          title: 'Transfer Case & Differentials (AWD/4WD)',
          content: 'AWD and 4WD vehicles have additional drivetrain components: transfer case, front differential, and rear differential. Each contains fluid that breaks down over time. These are often overlooked in maintenance but their failure is extremely expensive.',
          tips: [
            'Transfer case fluid: change every 30,000-60,000 miles per your manual',
            'Differential fluid: change every 30,000-50,000 miles — more frequently if towing',
            'Whining or humming from the rear on deceleration = differential fluid may be low or degraded',
            'Use the correct fluid spec — limited-slip differentials need friction modifier additive',
            'Subaru, Audi Quattro, and BMW xDrive all have different AWD fluid requirements',
          ]
        },
      ]
    },
    {
      id: 'cooling',
      title: 'Cooling System',
      icon: 'coolant-temperature',
      emoji: '🌡️',
      color: '#2196F3',
      articles: [
        {
          title: 'Coolant Types and Mixing',
          content: 'Not all coolant is the same. Green (IAT), orange/pink (OAT), and yellow (HOAT) use different corrosion inhibitors and should NEVER be mixed. Using the wrong type can cause internal corrosion, clogging, and gasket damage.',
          tips: [
            'Check your owner\'s manual for the exact coolant type — color isn\'t always reliable',
            'Toyota uses red/pink long-life coolant, Honda uses blue, GM uses orange Dex-Cool',
            'Mixing coolant types creates gel/sludge that clogs the system',
            'Always use 50/50 mix with distilled water — tap water contains minerals that cause deposits',
            'Coolant flush is recommended every 5 years or 100,000 miles for modern long-life coolants',
          ]
        },
        {
          title: 'Radiator and Hose Inspection',
          content: 'The radiator dissipates engine heat through its thin aluminum fins. Over time, fins bend, internal passages clog, and plastic end tanks crack. Hoses become brittle and can burst without warning, leaving you stranded.',
          tips: [
            'Squeeze hoses when cold — they should be firm but pliable, not hard or mushy',
            'Replace hoses every 10 years or at first sign of cracking/swelling',
            'A pressure test ($50-100 at a shop) can find slow leaks you can\'t see',
            'Clean bugs and debris from radiator fins with a garden hose (gentle pressure, back to front)',
            'Aftermarket radiators are often better than OEM — aluminum full-core upgrades are popular',
          ]
        },
        {
          title: 'Water Pump Service',
          content: 'The water pump circulates coolant through the engine and heater core. It\'s driven by the timing belt, serpentine belt, or electrically. Failure causes rapid overheating. Most water pumps last 60,000-100,000 miles.',
          tips: [
            'Always replace the water pump when doing a timing belt — it\'s behind the belt and adds minimal labor cost',
            'Coolant leak from the front of the engine often = water pump weep hole leaking',
            'Grinding or whining noise from the front of the engine can indicate pump bearing failure',
            'Electric water pumps (BMW, newer cars) can fail without obvious symptoms until overheating',
            'Overheating with a full coolant system? Suspect the thermostat or water pump',
          ]
        },
        {
          title: 'Dealing with Overheating',
          content: 'Engine overheating can cause warped heads, blown head gaskets, and seized engines — damage that often costs more than the car is worth. Knowing what to do in the first 60 seconds is critical.',
          tips: [
            'Turn OFF the A/C and turn ON the heater full blast — this dumps engine heat through the cabin',
            'Pull over safely as soon as possible — do NOT keep driving to "make it to the shop"',
            'NEVER open the radiator cap when hot — pressurized coolant will erupt and cause severe burns',
            'Let the engine cool for at least 30 minutes before checking coolant level',
            'If you must drive, go slowly with the heater on max and stop if the gauge rises again',
            'White smoke from the exhaust + overheating = likely head gasket failure',
          ]
        },
      ]
    },
    {
      id: 'electrical',
      title: 'Electrical System',
      icon: 'car-battery',
      emoji: '🔋',
      color: Colors.forestGreen,
      articles: [
        {
          title: 'Battery Maintenance',
          content: 'Car batteries typically last 3-5 years. Heat kills batteries faster than cold — Southern states see shorter battery life. A battery can test fine one day and be dead the next, especially in temperature extremes.',
          tips: [
            'Clean corrosion from terminals with baking soda paste and a wire brush',
            'Extreme temperatures reduce battery life — both hot summers and cold winters',
            'Load test battery at every oil change if it\'s over 3 years old',
            'A slow crank in the morning is your warning sign — don\'t wait for a no-start',
            'AGM batteries (common in start-stop cars) need AGM-specific chargers',
          ]
        },
        {
          title: 'Alternator Health',
          content: 'The alternator charges your battery while driving and powers all electrical systems. A failing alternator may still work intermittently, masking the problem until the battery drains completely. Most alternators last 100,000-150,000 miles.',
          tips: [
            'Dimming headlights at idle that brighten when revving = alternator not charging enough',
            'Battery warning light on the dash usually means the alternator, not the battery',
            'A multimeter should read 13.5-14.5V at the battery with the engine running',
            'Whining or grinding from the alternator area = bearing failure imminent',
            'A weak alternator will kill a new battery in weeks — test the alternator before replacing the battery',
          ]
        },
        {
          title: 'Fuse and Relay Troubleshooting',
          content: 'Fuses protect circuits from overload. When something electrical stops working (power windows, radio, lights), a blown fuse is the most common and cheapest fix. Your car has two fuse boxes: one under the hood and one under the dashboard.',
          tips: [
            'Your owner\'s manual has a fuse diagram — keep a copy in your glovebox',
            'A blown fuse has a broken metal strip visible through the clear plastic',
            'If the same fuse keeps blowing, there\'s a short circuit — don\'t just keep replacing the fuse',
            'Relays are basically electric switches — a clicking noise when they should be silent means replacement',
            'Carry a $5 assortment pack of spare fuses — it\'s saved many roadside situations',
          ]
        },
        {
          title: 'LED and Headlight Upgrades',
          content: 'Headlight technology has evolved from sealed beams to halogen, HID/Xenon, and now LED. Upgrading can dramatically improve night visibility, but improper upgrades can blind other drivers and fail inspection.',
          tips: [
            'LED bulbs in halogen housings scatter light and blind oncoming traffic — it\'s illegal in many states',
            'Proper LED upgrade requires projector housings designed for LED',
            'Yellowed/cloudy headlight lenses reduce output by up to 80% — restore them for $20 with a kit',
            'HID ballast failure is common after 5-7 years — replacement costs $100-300 per side',
            'Aim your headlights after any upgrade — most cars have adjustment screws near the lens',
          ]
        },
      ]
    },
    {
      id: 'suspension',
      title: 'Suspension & Steering',
      icon: 'car-cruise-control',
      emoji: '🏎️',
      color: '#9C27B0',
      articles: [
        {
          title: 'Shocks and Struts',
          content: 'Shocks and struts control body motion and keep tires in contact with the road. They degrade gradually, so the decline in ride quality is often unnoticed. Most need replacement around 50,000-100,000 miles. The difference after replacement is dramatic.',
          tips: [
            'The bounce test: push down on a corner and release — more than 2 bounces means replacement',
            'Uneven tire wear (cupping/scalloping) is a strong indicator of worn shocks',
            'Struts are structural — they require an alignment after replacement',
            'Replace in pairs (both fronts or both rears) for balanced handling',
            'Leaking fluid from the shock body = it\'s done — replace it',
          ]
        },
        {
          title: 'Ball Joints and Tie Rods',
          content: 'Ball joints connect the control arms to the steering knuckle, allowing the wheel to turn and move up/down. Tie rods connect the steering rack to the knuckle. Both are wear items that affect alignment, steering feel, and safety.',
          tips: [
            'Clunking over bumps, especially at slow speeds, often = worn ball joints',
            'Play in the steering wheel (looseness at center) = likely worn tie rod ends',
            'A failed ball joint can cause the wheel to separate from the car — this is safety-critical',
            'Inner tie rods are hidden inside the steering rack boot — check for torn boots',
            'Always get an alignment after replacing any ball joint or tie rod',
          ]
        },
        {
          title: 'Power Steering Service',
          content: 'Hydraulic power steering uses fluid pumped by a belt-driven pump. Electric power steering (EPS) is increasingly common and maintenance-free. If you have hydraulic, the fluid breaks down over time and the pump is a wear item.',
          tips: [
            'Whining noise when turning = low power steering fluid or failing pump',
            'Check fluid level monthly — low fluid usually means there\'s a leak somewhere',
            'Power steering fluid should be changed every 50,000-75,000 miles',
            'Don\'t hold the wheel at full lock for more than a few seconds — it overheats the pump',
            'Electric power steering has no fluid — if steering feels wrong, it\'s likely a sensor or motor issue',
          ]
        },
        {
          title: 'Wheel Bearings',
          content: 'Wheel bearings allow your wheels to spin freely. They\'re sealed and lubricated for life on modern cars but eventually wear out, typically after 85,000-100,000+ miles. A failing wheel bearing makes a humming or growling noise that changes with speed.',
          tips: [
            'Humming that gets louder with speed and changes when turning = wheel bearing',
            'The sound changes direction when turning because weight shifts off the bad bearing',
            'Don\'t ignore wheel bearing noise — complete failure can cause the wheel to seize or separate',
            'Hub assembly replacement (bearing + hub as one unit) is common on modern cars — $150-400 per side',
            'ABS issues can sometimes be traced to a wheel bearing with an integrated speed sensor',
          ]
        },
      ]
    },
    {
      id: 'fluids',
      title: 'Essential Fluids',
      icon: 'oil',
      emoji: '💧',
      color: '#00BCD4',
      articles: [
        {
          title: 'Complete Fluid Guide',
          content: 'Your car depends on 6-8 different fluids, each with specific types, intervals, and consequences of neglect. Think of fluids as the lifeblood of your vehicle — they lubricate, cool, clean, and transfer force.',
          tips: [
            'Engine oil: the most critical — check level monthly, change per schedule',
            'Transmission fluid: often forgotten but failure is catastrophic ($3,000-6,000 repair)',
            'Brake fluid: absorbs moisture, replace every 2-3 years for safety',
            'Coolant: wrong type causes corrosion, flush every 5 years',
            'Power steering fluid: change every 50K-75K miles (hydraulic systems only)',
            'Differential/transfer case fluid: critical for AWD/4WD, change every 30K-60K miles',
          ]
        },
        {
          title: 'Windshield Washer Fluid',
          content: 'It seems trivial, but running out of washer fluid in winter or on a bug-covered highway is a genuine safety hazard. Use proper washer fluid — water alone can freeze and crack the reservoir, and doesn\'t clean well.',
          tips: [
            'Use winter-rated fluid (-20°F or lower) before cold weather hits',
            'Never use dish soap — it can damage paint and wiper rubber',
            'Rain-X washer fluid adds a water-beading coating while you clean',
            'Keep an extra gallon in your trunk during road trips',
            'If the sprayer stops working, check for clogged nozzles (use a pin to clear them)',
          ]
        },
        {
          title: 'DEF (Diesel Exhaust Fluid)',
          content: 'All diesel vehicles sold in the US since 2010 require DEF (AdBlue) — a urea solution injected into the exhaust to reduce NOx emissions. Running out will limit your engine to limp mode or prevent starting entirely.',
          tips: [
            'DEF consumption is roughly 2-3% of fuel usage — a tank lasts thousands of miles',
            'Buy DEF from high-turnover locations (truck stops) — it degrades after 1-2 years',
            'Don\'t store DEF above 86°F — heat breaks it down',
            'Most diesel trucks have a DEF gauge on the dash — don\'t ignore low warnings',
            'DEF is cheap (~$15/2.5 gallons) — there\'s no reason to run low',
          ]
        },
      ]
    },
    {
      id: 'ev',
      title: 'Electric Vehicles',
      icon: 'car-electric',
      emoji: '⚡',
      color: '#4CAF50',
      articles: [
        {
          title: 'EV Maintenance Basics',
          content: 'EVs have dramatically fewer maintenance needs than gas cars — no oil changes, no transmission fluid, no spark plugs, no exhaust system. But they\'re not maintenance-free. Tires, brakes, cabin filters, coolant, and the 12V battery still need attention.',
          tips: [
            'Tire wear is often faster on EVs due to instant torque and heavy battery weight',
            'Brake pads last much longer due to regenerative braking — but can corrode from lack of use',
            'Cabin air filter replacement is the same as any car — every 15K-25K miles',
            'Battery coolant needs periodic replacement (varies by manufacturer, often 4-8 years)',
            'The 12V accessory battery still exists and still dies — check it annually',
          ]
        },
        {
          title: 'Battery Health and Longevity',
          content: 'EV batteries degrade over time, losing capacity gradually. Most manufacturers warrant 70-80% capacity at 8 years/100,000 miles. Real-world data shows most batteries far exceed this. How you charge matters more than how much you drive.',
          tips: [
            'Keep daily charge between 20-80% for maximum longevity — avoid regular 100% charges',
            'DC fast charging is convenient but generates more heat — limit to when you need it',
            'Hot climates degrade batteries faster — park in shade when possible',
            'Cold weather temporarily reduces range but doesn\'t permanently damage the battery',
            'Tesla, Hyundai, and others let you set charge limits in the car — use this feature',
            'Battery degradation is steepest in the first year, then levels off to ~2-3% per year',
          ]
        },
        {
          title: 'Home Charging Setup',
          content: 'Level 1 (standard outlet) adds 3-5 miles per hour of charging. Level 2 (240V) adds 25-40 miles per hour. For most EV owners, Level 2 home charging eliminates range anxiety entirely — you wake up to a "full tank" every morning.',
          tips: [
            'Level 2 charger installation costs $500-1,500 including the unit and electrician',
            'A 48-amp charger on a 60-amp circuit is the sweet spot for home use',
            'ChargePoint, Grizzl-E, and Emporia are popular home charger brands',
            'A NEMA 14-50 outlet (same as an oven) is the most common plug for portable L2 chargers',
            'Federal tax credits may cover 30% of installation costs — check current incentives',
            'If you only drive 30-40 miles/day, Level 1 charging overnight is actually sufficient',
          ]
        },
        {
          title: 'Regenerative Braking Explained',
          content: 'Regen braking uses the electric motor as a generator when you lift off the accelerator, converting kinetic energy back to electricity. It extends range by 10-25% and dramatically reduces brake pad wear. Most EVs let you adjust regen intensity.',
          tips: [
            'Strong regen ("one-pedal driving") can nearly eliminate the need for the brake pedal in city driving',
            'Regen is less effective when the battery is full — braking distance increases after a full charge',
            'Cold batteries also reduce regen effectiveness — be cautious on cold morning descents',
            'Traditional brake pads on EVs can corrode from lack of use — apply them occasionally',
            'Learning one-pedal driving takes about a week — after that, you\'ll never want to go back',
          ]
        },
      ]
    },
    {
      id: 'hybrid',
      title: 'Hybrid Vehicles',
      icon: 'leaf',
      emoji: '🌿',
      color: '#8BC34A',
      articles: [
        {
          title: 'Hybrid System Maintenance',
          content: 'Hybrids combine a gas engine with an electric motor and battery. They need all the same maintenance as a gas car PLUS periodic hybrid-specific service. The good news: brakes last 2-3x longer due to regenerative braking, and the gas engine runs more efficiently.',
          tips: [
            'Oil change intervals are the same as the gas-only version of the car',
            'Hybrid brake pads often last 80,000-100,000+ miles thanks to regen braking',
            'Hybrid battery coolant (if applicable) needs periodic service',
            'The inverter coolant (separate from engine coolant on many hybrids) is often overlooked',
            'Spark plugs may last longer since the engine runs less frequently',
          ]
        },
        {
          title: 'Hybrid Battery Life',
          content: 'Hybrid batteries (NiMH or lithium-ion) are warranted for 8-10 years/100,000-150,000 miles. Toyota Prius batteries commonly last 200,000+ miles. Replacement costs have dropped significantly — refurbished batteries are a viable option.',
          tips: [
            'Toyota/Lexus hybrid batteries are among the most reliable — 200K+ miles is common',
            'New hybrid battery replacement: $2,000-4,000 (down from $5,000+ a decade ago)',
            'Refurbished batteries: $1,000-2,000 — a good option for older vehicles',
            'Reduced fuel economy is the first sign of battery degradation',
            'Keeping the 12V battery healthy is important — a dead 12V prevents the hybrid system from starting',
            'Cold weather reduces hybrid battery efficiency temporarily but doesn\'t cause permanent damage',
          ]
        },
        {
          title: 'Plug-In Hybrid (PHEV) Tips',
          content: 'PHEVs have a larger battery than regular hybrids, offering 20-50 miles of pure electric range. They need to be plugged in regularly to get the benefit. If you never charge it, you\'re just carrying around a heavy battery and getting worse MPG than a regular hybrid.',
          tips: [
            'Charge daily to maximize electric-only driving — that\'s the whole point of a PHEV',
            'Most PHEVs can charge overnight on a standard 120V outlet (Level 1)',
            'Engine oil still degrades with time even if the engine barely runs — change at least annually',
            'The gas engine will occasionally run even in EV mode to maintain itself',
            'PHEVs qualify for HOV lane access and tax credits in many states — check your state\'s rules',
          ]
        },
      ]
    },
    {
      id: 'seasonal',
      title: 'Seasonal Care',
      icon: 'weather-partly-cloudy',
      emoji: '🌦️',
      color: '#FF9800',
      articles: [
        {
          title: 'Winterizing Your Car',
          content: 'Cold weather is tough on cars. Battery capacity drops, tire pressure falls, oil thickens, and salt attacks the undercarriage. A little prep in fall prevents a lot of trouble in January.',
          tips: [
            'Test your battery — cold cranking amps drop significantly in freezing temperatures',
            'Switch to winter-rated washer fluid (-20°F or lower)',
            'Check coolant freeze protection with a $5 hydrometer — should protect to -34°F',
            'Consider winter tires if you get regular snow — the difference is night and day',
            'Wax the car before winter to protect paint from salt and road chemicals',
            'Keep an emergency kit: blanket, flashlight, jumper cables, small shovel, kitty litter for traction',
          ]
        },
        {
          title: 'Summer Heat Protection',
          content: 'Heat is actually harder on cars than cold. Batteries die faster, coolant systems work harder, A/C strains the engine, and UV destroys interior surfaces. Summer road trips need more prep than you\'d think.',
          tips: [
            'Check coolant level and condition before summer — overheating is the #1 summer breakdown',
            'Test A/C output with a thermometer in the vent — should be 35-45°F at the center vent',
            'Park in shade when possible — cabin temps can exceed 170°F in direct sun',
            'Use a windshield sunshade to protect the dashboard from UV cracking',
            'Tire blowouts increase in summer — check pressure and look for bulges/cracks',
            'Battery fluid evaporates faster in heat — if accessible, check electrolyte levels',
          ]
        },
        {
          title: 'Spring Maintenance Checklist',
          content: 'After winter, your car needs attention. Salt residue causes corrosion, potholes may have damaged alignment, and it\'s time to undo winter compromises.',
          tips: [
            'Wash the undercarriage thoroughly to remove salt and road chemicals',
            'Inspect tires for pothole damage — bulges on sidewalls mean the tire is compromised',
            'Check alignment if the car pulls or the steering wheel is off-center',
            'Swap back to all-season or summer tires if you ran winter tires',
            'Replace wiper blades — winter ice and scraping destroys them',
            'Test A/C before you need it — refrigerant can leak over winter',
          ]
        },
      ]
    },
    {
      id: 'diy',
      title: 'DIY Basics',
      icon: 'wrench',
      emoji: '🔧',
      color: '#795548',
      articles: [
        {
          title: 'Essential Tools for Car Owners',
          content: 'You don\'t need a full mechanic\'s toolset to handle basic car maintenance. A small investment in quality tools pays for itself after a few DIY jobs. Focus on the tools that cover 80% of common tasks.',
          tips: [
            'Socket set (3/8" drive, metric 8-19mm) covers most fasteners on modern cars',
            'A good floor jack + jack stands are essential — NEVER work under a car on just the jack',
            'Torque wrench ($30-50) prevents over/under-tightening — critical for wheels and oil drain plugs',
            'Oil filter wrench, funnel, and drain pan for oil changes',
            'OBD-II scanner ($20-50) reads check engine codes — pays for itself on the first use',
            'A headlamp is the single most underrated tool — you need both hands free under the car',
          ]
        },
        {
          title: 'DIY Oil Change Guide',
          content: 'An oil change is the most common DIY maintenance task. It takes 20-30 minutes once you\'ve done it a few times, saves $30-50 per change, and gives you a chance to inspect your car\'s underside.',
          tips: [
            'Warm up the engine for 2-3 minutes first — warm oil drains faster and more completely',
            'Always use a new crush washer on the drain plug — it\'s 50 cents and prevents leaks',
            'Hand-tighten the oil filter, then 3/4 turn more — don\'t over-tighten',
            'After refilling, run the engine for 30 seconds, shut off, wait 2 minutes, then check the dipstick',
            'Dispose of old oil at any auto parts store — they accept it for free',
            'Take a photo of the oil on the dipstick each time — you\'ll notice changes over time',
          ]
        },
        {
          title: 'Safely Lifting Your Car',
          content: 'Working under a car that\'s only supported by a jack is one of the most dangerous things you can do in your garage. Every year, people are killed by cars falling off jacks. Use jack stands. Always.',
          tips: [
            'NEVER work under a car supported only by a floor jack — use jack stands rated for your car\'s weight',
            'Place jack stands on the pinch welds or designated lift points (check your manual)',
            'Chock the wheels on the opposite end from where you\'re lifting',
            'Shake the car after it\'s on stands to make sure it\'s stable before going under',
            'A set of ramps ($40-60) is even safer and easier for oil changes',
            'Keep the floor jack as a backup under the car even with stands in place',
          ]
        },
        {
          title: 'When to DIY vs Go to a Shop',
          content: 'Some jobs are perfect for DIY — others require special tools, expertise, or safety equipment that make a shop visit worthwhile. Knowing the boundary saves both money and headaches.',
          tips: [
            'Great DIY jobs: oil change, air filter, cabin filter, battery, wiper blades, brake pads',
            'Intermediate DIY: spark plugs, brake rotors, thermostat, coolant flush, headlight bulbs',
            'Leave to pros: timing belt, transmission service, A/C recharge, alignment, suspension work',
            'Any job involving fuel lines, airbags, or high-voltage hybrid components = professional only',
            'YouTube is invaluable — search "[your exact car] [job name]" before starting any DIY project',
            'If a DIY job goes wrong, towing + shop repair costs more than just going to the shop first',
          ]
        },
      ]
    },
    {
      id: 'buying',
      title: 'Buying & Ownership',
      icon: 'car',
      emoji: '🚗',
      color: '#607D8B',
      articles: [
        {
          title: 'Pre-Purchase Inspection',
          content: 'A pre-purchase inspection (PPI) by an independent mechanic is the single most important thing you can do when buying a used car. It costs $100-200 and can save you thousands by uncovering hidden problems.',
          tips: [
            'Always get a PPI — even on certified pre-owned vehicles',
            'Choose YOUR mechanic, not one recommended by the seller',
            'A good PPI checks: engine compression, suspension wear, brake condition, fluid leaks, electrical systems',
            'Run a Carfax/AutoCheck report but don\'t rely on it alone — not all accidents are reported',
            'Check for consistent paint thickness with a paint meter — repaints indicate accident repair',
            'If the seller won\'t allow a PPI, walk away — they\'re hiding something',
          ]
        },
        {
          title: 'Understanding Vehicle History',
          content: 'A car\'s history tells you everything about its future reliability. Service records, accident history, number of owners, and where it lived all matter. A well-maintained high-mileage car is often better than a neglected low-mileage one.',
          tips: [
            'Ask for maintenance records — a thick folder of receipts is a green flag',
            'Single-owner vehicles tend to be better maintained than multi-owner ones',
            'Cars from rust-belt states (Northeast, Midwest) may have hidden undercarriage corrosion',
            'Flood-damaged cars are sometimes retitled and resold — check for musty smells and water lines',
            'Salvage title = the car was totaled by insurance — avoid unless you really know what you\'re getting',
            'Verify the VIN matches on the dash, door jamb, and title — mismatches indicate problems',
          ]
        },
        {
          title: 'Total Cost of Ownership',
          content: 'The purchase price is just the beginning. Insurance, fuel, maintenance, repairs, depreciation, registration, and financing all add up. A cheap car with expensive maintenance (BMW, Audi) can cost more than a pricier car that\'s cheap to run (Toyota, Honda).',
          tips: [
            'Check insurance quotes BEFORE buying — some cars cost 2-3x more to insure',
            'European luxury cars have dramatically higher repair costs after warranty expires',
            'Depreciation is the biggest cost of ownership — it\'s invisible but enormous',
            'Toyota, Honda, and Subaru consistently have the lowest maintenance costs long-term',
            'Edmunds True Cost to Own calculator gives realistic 5-year ownership projections',
            'CPO (Certified Pre-Owned) lets someone else eat the steepest depreciation',
          ]
        },
        {
          title: 'Extended Warranty: Worth It?',
          content: 'Extended warranties (vehicle service contracts) are a gamble. They\'re profitable for the company selling them, which means on average you\'ll pay more than you save. But they can provide peace of mind on complex, expensive-to-repair vehicles.',
          tips: [
            'Factory-backed extended warranties (e.g., Toyota Care+, Honda Care) are the most reliable',
            'Third-party warranties vary wildly — research the company thoroughly before buying',
            'Extended warranties make more sense on complex/luxury vehicles (BMW, Mercedes, Land Rover)',
            'They make less sense on reliable vehicles (Toyota, Honda) — you\'re paying for insurance you probably won\'t use',
            'You can usually buy the manufacturer\'s extended warranty later — you don\'t have to decide at the dealer',
            'Read the exclusions carefully — the devil is always in the details',
          ]
        },
      ]
    },
    {
      id: 'safety',
      title: 'Safety & Emergency',
      icon: 'shield-checkmark',
      emoji: '🛡️',
      color: '#F44336',
      articles: [
        {
          title: 'Roadside Emergency Kit',
          content: 'Every car should carry a basic emergency kit. Breakdowns happen to everyone, and being prepared turns a crisis into an inconvenience. Focus on the items that cover the most likely scenarios.',
          tips: [
            'Jumper cables or a portable jump starter ($50-80) — the #1 most useful emergency tool',
            'Reflective triangles or flares — visibility on the roadside prevents secondary accidents',
            'Basic first aid kit, flashlight with fresh batteries, and a phone charger',
            'Tire inflator or fix-a-flat — many new cars don\'t include a spare tire',
            'Warm blanket and water bottles — especially important in winter or remote areas',
            'A $20 tire pressure gauge and a lug wrench that fits your car\'s lug nuts',
          ]
        },
        {
          title: 'What to Do After an Accident',
          content: 'In the stress of a collision, it\'s easy to forget important steps. Having a mental checklist helps you stay calm and protect yourself legally and financially.',
          tips: [
            'Check for injuries first — call 911 if anyone is hurt, no matter how minor it seems',
            'Move vehicles out of traffic if safely possible — turn on hazard lights immediately',
            'Take photos of everything: damage, license plates, road conditions, traffic signs, other car\'s details',
            'Exchange info: name, insurance, phone, license number — but don\'t admit fault',
            'File a police report even for minor accidents — insurance companies often require it',
            'See a doctor within 24-48 hours even if you feel fine — adrenaline masks injury symptoms',
          ]
        },
        {
          title: 'Tire Blowout Response',
          content: 'A tire blowout at highway speed is terrifying but survivable if you react correctly. The instinct to brake hard or swerve is exactly wrong — it causes rollovers. The correct response is counterintuitive.',
          tips: [
            'Do NOT slam the brakes — this causes loss of control',
            'Keep a firm grip on the steering wheel and steer straight',
            'Gently press the GAS pedal briefly to stabilize the car — yes, accelerate slightly',
            'Let the car slow down gradually on its own, then gently brake to a stop',
            'Pull completely off the road onto a flat, firm surface before attempting a tire change',
            'If you can\'t safely change the tire, call roadside assistance — standing next to highway traffic is dangerous',
          ]
        },
        {
          title: 'Dashboard Warning Lights Guide',
          content: 'Modern cars have dozens of warning lights. Some are informational, some are urgent, and a few mean "stop driving immediately." Knowing the difference prevents both unnecessary panic and dangerous neglect.',
          tips: [
            'Red lights = stop driving or address immediately (oil pressure, temperature, brakes)',
            'Yellow/amber lights = caution, service soon but not emergency (check engine, TPMS, ABS)',
            'Oil pressure light: STOP IMMEDIATELY — driving with no oil pressure destroys the engine in minutes',
            'Temperature light: pull over ASAP — overheating can crack the head or blow the gasket',
            'Check engine light (solid): schedule service soon. Check engine light (flashing): pull over now',
            'TPMS light: check tire pressures — could be low pressure or a sensor battery dying',
          ]
        },
      ]
    },
    {
      id: 'money',
      title: 'Saving Money',
      icon: 'cash',
      emoji: '💰',
      color: '#FFC107',
      articles: [
        {
          title: 'Avoiding Dealer Upsells',
          content: 'Dealership service departments make most of their profit on upsells and overpriced maintenance. Some recommendations are legitimate, but many are either unnecessary or dramatically overpriced compared to independent shops.',
          tips: [
            'Cabin air filter replacement: dealers charge $60-80, DIY takes 2 minutes and costs $15',
            '"Engine flush" and "fuel system cleaning" are almost never necessary — skip them',
            '"Transmission flush" at 30K miles on a car that calls for 60K? They\'re padding the bill',
            'Get a second opinion at an independent shop before approving expensive dealer recommendations',
            'Maintenance at an independent shop does NOT void your warranty — that\'s a myth (Magnuson-Moss Act)',
            'Keep all receipts — you just need to prove maintenance was done, not that a dealer did it',
          ]
        },
        {
          title: 'Finding a Good Mechanic',
          content: 'A trustworthy independent mechanic saves you thousands over your car-owning lifetime. They charge less than dealers, often provide better service, and are incentivized to build long-term relationships rather than upsell.',
          tips: [
            'Ask friends, family, and local subreddits/forums for recommendations',
            'ASE certification is a good baseline — look for the blue seal',
            'A good shop will show you the problem and explain it, not just hand you a bill',
            'Start with a small job (oil change) to gauge their honesty and quality',
            'Specialty shops (German car specialists, Japanese car shops) often provide better service for specific makes',
            'Check Google/Yelp reviews but focus on the detailed ones, not just the star rating',
          ]
        },
        {
          title: 'Preventive vs Reactive Maintenance',
          content: 'Spending $500 on scheduled maintenance prevents $3,000 repairs. This isn\'t marketing — it\'s mechanical reality. Every fluid change, filter replacement, and inspection catches problems when they\'re small.',
          tips: [
            'A $60 coolant flush prevents a $2,000+ head gasket repair',
            'A $200 timing belt replacement prevents a $4,000+ engine rebuild',
            'A $150 transmission fluid change prevents a $3,500+ transmission replacement',
            'Brake pads ($200) wear into rotors ($400+) which can damage calipers ($600+)',
            'Track your maintenance in this app — it pays for itself by keeping you on schedule',
            'The cheapest car to maintain is the one you already own — switching cars resets the depreciation clock',
          ]
        },
        {
          title: 'Fuel Economy Tips',
          content: 'Your driving habits affect fuel economy more than almost any modification. Aggressive driving can reduce MPG by 15-33% on the highway. Small behavioral changes add up to hundreds of dollars per year.',
          tips: [
            'Accelerate gently and anticipate stops — aggressive driving wastes the most fuel',
            'Remove roof racks and cargo boxes when not in use — they create significant drag at highway speeds',
            'Proper tire pressure alone improves MPG by up to 3%',
            'Use cruise control on highways — maintaining steady speed is more efficient than human throttle control',
            'A/C at highway speed is more efficient than open windows (windows create drag)',
            'Every 100 lbs of cargo reduces MPG by about 1% — clean out the trunk',
            'Premium gas in a car that takes regular provides zero benefit — you\'re just wasting money',
          ]
        },
      ]
    },
  ]
};

const CategoryCard = ({ category, onPress }) => (
  <TouchableOpacity
    style={[Shared.card, { marginBottom: Spacing.md }]}
    onPress={() => onPress(category)}
    activeOpacity={0.9}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{
        backgroundColor: category.color + '20',
        borderRadius: 24,
        padding: 16,
        marginRight: Spacing.md,
        borderWidth: 1,
        borderColor: category.color + '30',
      }}>
        <Text style={{ fontSize: 28 }}>{category.emoji}</Text>
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: 4 }]}>
          {category.title}
        </Text>
        <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
          {category.articles.length} article{category.articles.length !== 1 ? 's' : ''} • 
          {Math.ceil(category.articles.length * 3)} min read
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </View>
  </TouchableOpacity>
);

const ArticleCard = ({ article, onPress }) => (
  <TouchableOpacity
    style={[Shared.card, { marginBottom: Spacing.md }]}
    onPress={() => onPress(article)}
    activeOpacity={0.9}
  >
    <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: Spacing.sm }]}>
      {article.title}
    </Text>
    
    <Text style={[Typography.body, { 
      color: Colors.textSecondary, 
      marginBottom: Spacing.md,
      lineHeight: 20,
    }]} numberOfLines={3}>
      {article.content}
    </Text>
    
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="bulb-outline" size={14} color={Colors.warning} style={{ marginRight: 4 }} />
        <Text style={[Typography.caption, { color: Colors.primary }]}>
          {article.tips.length} tip{article.tips.length !== 1 ? 's' : ''}
        </Text>
        <Text style={[Typography.caption, { color: Colors.textSecondary, marginLeft: 8 }]}>
          • 3 min read
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
    </View>
  </TouchableOpacity>
);

const ArticleView = ({ article, onBack }) => (
  <ScrollView 
    style={{ flex: 1 }}
    contentContainerStyle={{ padding: Spacing.horizontal }}
  >
    {/* Header */}
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.section }}>
      <TouchableOpacity
        onPress={onBack}
        style={{
          backgroundColor: Colors.surface1,
          borderRadius: 24,
          padding: 10,
          marginRight: Spacing.md,
          borderWidth: 1,
          borderColor: Colors.glassBorder,
        }}
      >
        <Ionicons name="arrow-back" size={20} color={Colors.primary} />
      </TouchableOpacity>
      
      <Text style={[Typography.h1, { color: Colors.textPrimary, flex: 1 }]}>
        {article.title}
      </Text>
    </View>

    {/* Content */}
    <View style={[Shared.card, { marginBottom: Spacing.lg }]}>
      <Text style={[Typography.body, { 
        color: Colors.textPrimary, 
        lineHeight: 24,
        fontSize: 16,
      }]}>
        {article.content}
      </Text>
    </View>

    {/* Tips */}
    <View style={Shared.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg }}>
        <View style={{
          backgroundColor: Colors.warning + '20',
          borderRadius: 20,
          padding: 8,
          marginRight: Spacing.sm,
          borderWidth: 1,
          borderColor: Colors.warning + '30',
        }}>
          <Ionicons name="bulb" size={20} color={Colors.warning} />
        </View>
        <Text style={[Typography.h2, { color: Colors.textPrimary }]}>
          pro tips
        </Text>
      </View>

      {article.tips.map((tip, index) => (
        <View key={index} style={{
          flexDirection: 'row',
          marginBottom: index === article.tips.length - 1 ? 0 : Spacing.lg,
        }}>
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: Colors.primary,
            marginTop: 8,
            marginRight: Spacing.md,
          }} />
          
          <Text style={[Typography.body, { 
            color: Colors.textPrimary, 
            flex: 1,
            lineHeight: 22,
          }]}>
            {tip}
          </Text>
        </View>
      ))}
    </View>
  </ScrollView>
);

const CategoryView = ({ category, onBack, onArticlePress }) => (
  <ScrollView 
    style={{ flex: 1 }}
    contentContainerStyle={{ padding: Spacing.horizontal }}
  >
    {/* Header */}
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.section }}>
      <TouchableOpacity
        onPress={onBack}
        style={{
          backgroundColor: Colors.surface1,
          borderRadius: 24,
          padding: 10,
          marginRight: Spacing.md,
          borderWidth: 1,
          borderColor: Colors.glassBorder,
        }}
      >
        <Ionicons name="arrow-back" size={20} color={Colors.primary} />
      </TouchableOpacity>
      
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          backgroundColor: category.color + '20',
          borderRadius: 20,
          padding: 8,
          marginRight: Spacing.sm,
          borderWidth: 1,
          borderColor: category.color + '30',
        }}>
          <Text style={{ fontSize: 20 }}>{category.emoji}</Text>
        </View>
        <Text style={[Typography.h1, { color: Colors.textPrimary }]}>
          {category.title}
        </Text>
      </View>
    </View>

    {/* Articles */}
    {category.articles.map((article, index) => (
      <ArticleCard
        key={index}
        article={article}
        onPress={onArticlePress}
      />
    ))}
  </ScrollView>
);

// Featured articles — curated essentials every car owner should know
const featuredArticles = [
  { categoryId: 'engine', articleIndex: 0 },    // Oil Change Intervals
  { categoryId: 'engine', articleIndex: 4 },     // Understanding Check Engine Light
  { categoryId: 'brakes', articleIndex: 0 },     // Brake Pad Replacement
  { categoryId: 'tires', articleIndex: 1 },      // Proper Tire Pressure
  { categoryId: 'electrical', articleIndex: 0 }, // Battery Maintenance
  { categoryId: 'diy', articleIndex: 3 },        // When to DIY vs Go to a Shop
  { categoryId: 'money', articleIndex: 2 },      // Preventive vs Reactive Maintenance
];

export default function LearnScreen() {
  const [currentView, setCurrentView] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryPress = (category) => {
    Haptics.selectionAsync();
    setSelectedCategory(category);
    setCurrentView('category');
  };

  const handleArticlePress = (article) => {
    Haptics.selectionAsync();
    setSelectedArticle(article);
    setCurrentView('article');
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentView === 'article') {
      setCurrentView('category');
      setSelectedArticle(null);
    } else if (currentView === 'category') {
      setCurrentView('categories');
      setSelectedCategory(null);
    }
  };

  // Filter categories and articles based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return knowledgeBase.categories;
    
    const query = searchQuery.toLowerCase();
    return knowledgeBase.categories
      .map(category => ({
        ...category,
        articles: category.articles.filter(article =>
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query) ||
          article.tips.some(tip => tip.toLowerCase().includes(query))
        ),
      }))
      .filter(category => category.articles.length > 0);
  }, [searchQuery]);

  const getFeaturedArticleData = () => {
    return featuredArticles.map(featured => {
      const category = knowledgeBase.categories.find(c => c.id === featured.categoryId);
      if (!category) return null;
      const article = category.articles[featured.articleIndex];
      if (!article) return null;
      return { ...article, category, categoryEmoji: category.emoji };
    }).filter(Boolean);
  };

  if (currentView === 'article' && selectedArticle) {
    return (
      <View style={[Shared.container, { paddingHorizontal: 0 }]}>
        <ArticleView article={selectedArticle} onBack={handleBack} />
      </View>
    );
  }

  if (currentView === 'category' && selectedCategory) {
    return (
      <View style={[Shared.container, { paddingHorizontal: 0 }]}>
        <CategoryView 
          category={selectedCategory} 
          onBack={handleBack}
          onArticlePress={handleArticlePress}
        />
      </View>
    );
  }

  const featuredArticlesData = getFeaturedArticleData();

  return (
    <View style={Shared.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Spacing.lg, paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={{ marginBottom: Spacing.lg }}>
          <Text style={[Typography.body, { 
            color: Colors.textSecondary, 
            marginBottom: Spacing.md,
            lineHeight: 22,
          }]}>
            learn car maintenance from the experts. build confidence in your maintenance decisions.
          </Text>
        </View>

        {/* Search Bar */}
        <View style={{ marginBottom: Spacing.lg }}>
          <View style={[Shared.input, {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: Spacing.md,
          }]}>
            <Ionicons name="search" size={18} color={Colors.textSecondary} style={{ marginRight: Spacing.sm }} />
            <TextInput
              style={{
                flex: 1,
                color: Colors.textPrimary,
                fontSize: 15,
                fontFamily: 'Nunito_400Regular',
                height: '100%',
              }}
              placeholder="Search articles..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          {searchQuery.length > 0 && (
            <Text style={[Typography.small, { color: Colors.textSecondary, marginTop: Spacing.xs }]}>
              {filteredCategories.reduce((sum, cat) => sum + cat.articles.length, 0)} articles found
            </Text>
          )}
        </View>

        {/* Featured Articles */}
        {!searchQuery && featuredArticlesData.length > 0 && (
          <View style={{ marginBottom: Spacing.section }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg }}>
              <Text style={{ fontSize: 20, marginRight: Spacing.sm }}>⭐</Text>
              <Text style={[Typography.h1, { color: Colors.textPrimary }]}>
                Essential Reading
              </Text>
            </View>
            
            {featuredArticlesData.map((article, index) => (
              <TouchableOpacity
                key={index}
                style={[Shared.card, { marginBottom: Spacing.md }]}
                onPress={() => handleArticlePress(article)}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, marginRight: Spacing.md }}>
                    {article.categoryEmoji}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.body, { 
                      color: Colors.textPrimary, 
                      fontFamily: 'Nunito_600SemiBold',
                      marginBottom: 2,
                    }]}>
                      {article.title}
                    </Text>
                    <Text style={[Typography.small, { color: Colors.textSecondary }]} numberOfLines={2}>
                      {article.content}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} style={{ marginLeft: Spacing.sm }} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Categories Header */}
        {!searchQuery && (
          <Text style={[Typography.h1, { color: Colors.textPrimary, marginBottom: Spacing.lg }]}>
            All Topics
          </Text>
        )}

        {/* Categories */}
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onPress={handleCategoryPress}
            />
          ))
        ) : (
          <View style={{
            backgroundColor: Colors.surface1,
            borderRadius: 12,
            padding: Spacing.xl,
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 40, marginBottom: Spacing.md }}>🔍</Text>
            <Text style={[Typography.h2, { color: Colors.textPrimary, marginBottom: Spacing.xs }]}>
              No articles found
            </Text>
            <Text style={[Typography.body, { color: Colors.textSecondary, textAlign: 'center' }]}>
              Try different search terms
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}