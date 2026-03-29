import { Vector3 } from 'three';

export interface Company {
    id: string;
    name: string;
    description: string;
    introduction?: string;
    fullDescription?: string;
    logo: string;
    meshNames: string[];
    beaconPosition: [number, number, number];
    doorModel: 'OP1' | 'OP2' | 'OP3' | 'OP4' | 'PWR1' | 'PWR2' | 'PWR3' | 'PWR4' | 'SP1' | 'SP2' | 'SP3' | 'SP4';
    website?: string;
    content?: {
        title?: string;
        body?: string | string[];
        list?: string[];
    }[];
}

export function getCompanyById(id: string): Company | undefined {
    return companies.find(c => c.id === id);
}

export function getCompanyByMesh(meshName: string): Company | undefined {
    return companies.find(c => c.meshNames.includes(meshName));
}

export const companies: Company[] = [
    {
        id: "arabian_holding_group",
        name: "Arabian Holding Group - Iraq",
        description: "A Driver of Development and a Symbol of Trust.",
        introduction: "Arabian Holding Group is one of Iraq's leading companies, officially registered with the Ministry of Trade. It was established in 2005 in accordance with Article 21 of the Companies Law No. (21) of 1997. The Group operates with strengthened capital, reflecting its financial solidity and its capability to execute major strategic projects across Iraq.\n\nThe Group is guided by a clear vision focused on business development and the creation of effective partnerships across various sectors, with full commitment to professional and legal standards. It enhances client confidence by delivering high-quality services and projects that have a tangible economic and developmental impact.",
        logo: "/logos/Arabian Holding Group - Iraq.png",
        meshNames: ["door16"],
        beaconPosition: [0, 79, 7], // Tower Roof (Adjusted Down)
        doorModel: "OP1",
        website: "https://arabianholdinggroup.com",
        content: [
            {
                title: "About the Group",
                body: "At the heart of Iraq's evolving business environment, Arabian Holding Group stands out as an active economic and investment entity and a strategic partner in the journey of construction and development. Founded on an ambitious vision and a solid legacy of credibility, the Group serves as a bridge between Iraq's promising potential and global best practices, contributing to the shaping of a sustainable economic future.\n\nThe Group adopts a business model based on diversification, innovation, and sustainability. Its investments go beyond projects alone to include investment in people and the national economy, through a diversified portfolio of vital sectors that contribute to infrastructure development and improved quality of life."
            },
            {
                title: "Our Business Sectors",
                body: "Diversity That Supports the National Economy. Our subsidiaries and specialized branches operate across several key development sectors, including:",
                list: [
                    "Energy and Infrastructure: Investment in conventional and renewable energy projects, the oil and gas sector, and the development of essential infrastructure.",
                    "Real Estate and Construction: Development of integrated residential, commercial, and service projects in accordance with the latest international standards of design and quality.",
                    "Industry and Agriculture: Supporting the industrial sector through manufacturing projects and strengthening agriculture to contribute to food security.",
                    "Trade and Distribution: Partnerships and representation of global brands in automobiles, equipment, technology, and consumer goods, supported by a wide distribution network.",
                    "Financial and Investment Services: Providing specialized investment solutions and advisory services, and contributing to the development of the financial sector.",
                    "Telecommunications and Technology: Investment in digital infrastructure and modern technological services, supporting Iraq's digital transformation journey."
                ]
            },
            {
                title: "Our Values",
                body: "The Foundation of Your Trust. All our operations are built upon a solid set of values, including:",
                list: [
                    "Commitment and Reliability: Fulfilling promises and building long-term relationships with partners and clients.",
                    "Quality and Excellence: Applying the highest standards in planning, execution, and service delivery.",
                    "Innovation and Development: Adopting innovative solutions and modern technologies to keep pace with the future.",
                    "Social Responsibility: Actively contributing to the support of education, healthcare, and environmental initiatives.",
                    "National Partnership: Acting as a strategic partner to both the public and private sectors, with the belief that our growth is inseparable from Iraq's growth."
                ]
            },
            {
                title: "Our Vision for the Future",
                body: "Arabian Holding Group is not merely a company, but a coalition of expertise and visions dedicated to serving Iraq and building its economy. We welcome all constructive partnership opportunities with global investors, local companies, government institutions, and ambitious Iraqi talents.\n\nLet us build a brighter future together.\n\nArabian Holding Group - Iraq\nPartners in Development... Committed to Trust"
            }
        ]
    },
    {
        id: "mawaraa_al_bihar",
        name: "Mawaraa Al-Bihar",
        description: "General Trading & Commercial Agencies Ltd.",
        introduction: "Mawaraa Al-Bihar General Trading & Commercial Agencies Ltd. is a private Iraqi company officially registered with the Ministry of Trade – Companies Registration Directorate of the Republic of Iraq. The company was established with a capital of IQD 100,000,000 (one hundred million Iraqi dinars), qualifying it to conduct general trading and commercial agency activities at both the local and international levels, in accordance with approved legal and professional frameworks.",
        logo: "/logos/Mawaraa-Al-Bihar.png",
        meshNames: ["door21"],
        beaconPosition: [-25.26, 44, -15.0], // Tier3, angle~260°
        doorModel: "OP3",
        website: "https://mawaraa-albihar.com",
        content: [
            {
                title: "Basic Company Information",
                list: [
                    "Full Legal Name: Mawaraa Al-Bihar General Trading & Commercial Agencies Ltd.",
                    "Capital: IQD 100,000,000 (One Hundred Million Iraqi Dinars)",
                    "Date of Establishment: April 12, 2005",
                    "Legal Framework: Registered in accordance with Article 21 of the Iraqi Companies Law No. (21) of 1997"
                ]
            },
            {
                title: "Main Business Activities",
                body: "The company operates in two principal areas that form the foundation of its business:",
                list: [
                    "General Trading: Import and export of goods and commodities of various types; domestic trade and distribution of consumer and industrial products; and managing wholesale/retail operations.",
                    "Commercial Agencies: Representing international companies and manufacturers to obtain exclusive agencies within Iraq; marketing, distributing, and providing after-sales support."
                ]
            },
            {
                title: "Vision and Mission",
                body: "Our Vision: To be among the leading companies in the field of general trading and commercial agencies in Iraq and the region, by building strong business networks and creating sustainable added value for clients and partners.\n\nOur Mission: To deliver integrated and reliable commercial solutions based on product and service quality, while adhering to the highest standards of integrity, efficiency, and professionalism in all commercial transactions."
            },
            {
                title: "Our Services",
                list: [
                    "Import and Export Services: Managing and facilitating cross-border commercial and logistics operations.",
                    "Local Distribution: An efficient distribution network covering various Iraqi provinces.",
                    "Exclusive Agencies: Representation of global brands across multiple sectors.",
                    "Commercial Consulting: Market studies and investment opportunity analysis.",
                    "Logistics Support: Oversight of shipping, customs clearance, and warehousing operations."
                ]
            }
        ]
    },
    {
        id: "al_irtikaz",
        name: "Al-Irtikaz Company",
        description: "Integrated artistic production, marketing, and technical solutions.",
        introduction: "Al-Irtikaz Company is a fully integrated Iraqi commercial entity, officially established under registered documentation with the Iraqi Ministry of Trade – Companies Registration Directorate. The company adopts a multi-dimensional business model that combines artistic production, marketing, publishing, and technical services under one umbrella, delivering integrated solutions to its clients.",
        logo: "/logos/Smart-City.png",
        meshNames: ["door24"],
        beaconPosition: [12.73, 67, -12.73], // Tier5, angle~135°
        doorModel: "OP4",
        website: "https://alirtikaz.com",
        content: [
            {
                title: "Legal Basis and Official Information",
                list: [
                    "Legal Form: Limited Liability Company (LLC)",
                    "Capital: IQD 100,000,000 (One Hundred Million Iraqi Dinars)",
                    "Founder: Omar Habib Abdulrazzaq",
                    "Address: Baghdad - Al-Ghazaliya 107/5.1/1.6.17",
                    "System Registration Number: 82690 - Al-Irtikaz",
                    "System Entry Date: 17/03/2024"
                ]
            },
            {
                title: "Areas of Specialization and Services",
                list: [
                    "Artistic Production and Distribution: Production of artistic and creative works of all types and supporting local talents.",
                    "Advertising, Publishing, and Promotion: Integrated advertising campaigns, digital publishing, and social media management.",
                    "Technical and Professional Service: Professional photography, electronic management solutions, and post-production for visual media."
                ]
            },
            {
                title: "Core Values",
                list: [
                    "Legal Compliance: Operating strictly within approved Iraqi regulatory frameworks.",
                    "Creativity and Innovation: Delivering innovative artistic and advertising solutions.",
                    "Integration: Offering a comprehensive service package under one roof.",
                    "Professionalism: Adhering to the highest standards of quality and performance efficiency.",
                    "Technological Advancement: Utilizing the latest management and production technologies."
                ]
            }
        ]
    },
    {
        id: "nidaa_al_ard",
        name: "Nidaa Al-Ard Company",
        description: "Leader in modern agricultural investments and genetic research.",
        introduction: "Nidaa Al-Ard Company is a leading Iraqi entity specializing in agricultural investments, general trading, import and export of agricultural materials and fertilizers, livestock and agricultural wealth investments, advanced agricultural services, trading of agricultural supplies and equipment, as well as the trade of crops, fertilizers, and pesticides.\n\nThe company was founded in 2024 to deliver innovative, high-quality solutions that meet the needs of local and regional markets, while contributing to the development of the agricultural sector on scientific and sustainable foundations. Nidaa Al-Ard believes that innovation, quality, and customer commitment are the core pillars of sustainable success.",
        logo: "/logos/Desert-Star.png",
        meshNames: ["door11"],
        beaconPosition: [26.6, 54, -4.69], // Tier4, angle~80°
        doorModel: "PWR1",
        website: "https://nidaa-alard.com",
        content: [
            {
                title: "A New Vision: Smart Agriculture",
                body: "We are leading a qualitative shift from traditional to 'Smart Agriculture' through the establishment of a state-of-the-art Agricultural Genetics Laboratory. This infrastructure allows us to proactively address climate change, water scarcity, and food security by developing adapted plant varieties and improving crop productivity through biotechnology."
            },
            {
                title: "Genetic Research Objectives",
                list: [
                    "Identify plant genetic traits for adaptation to local conditions.",
                    "Tissue culture for rapid propagation of improved varieties.",
                    "Early and accurate molecular diagnostics for plant diseases.",
                    "Establishment of a local gene bank for plant resources."
                ]
            },
            {
                title: "Strategic Impact",
                list: [
                    "Increase in productivity by 30% to 40%.",
                    "Reduction of production costs through lower chemical input usage.",
                    "Creation of high-yield strategic crops (Palms, Wheat, Barley).",
                    "Environmental conservation through rationalized water use."
                ]
            }
        ]
    },
    {
        id: "al_takween",
        name: "Al-Takween",
        description: "Commercial Agencies Company (LLC).",
        introduction: "Al-Takween Commercial Agencies Company (LLC) was established in accordance with the provisions of the Iraqi Companies Law No. (21) of 1997 and the Commercial Agencies Regulation Law No. (79) of 2017. The official certificate of incorporation was issued on November 1, 2023, with an authorized capital of one hundred million Iraqi dinars, reflecting the company’s seriousness and capacity to implement large-scale and diverse projects within the Iraqi market.",
        logo: "/logos/Al-Takween.png",
        meshNames: ["door13"],
        beaconPosition: [29.94, 44, -8.02], // Tier3
        doorModel: "PWR3",
        website: "https://altakween.com",
        content: [
            {
                title: "Strategic Objectives",
                list: [
                    "Obtaining exclusive agencies for leading brands across multiple sectors.",
                    "Developing modern and efficient distribution channels covering all Iraqi governorates.",
                    "Providing commercial and legal consultancy for companies entering the Iraqi market.",
                    "Building a specialized team in agency management and logistics."
                ]
            },
            {
                title: "Core Business Areas",
                list: [
                    "Exclusive Commercial Agencies: Representation in food, pharmaceuticals, electronics, and construction.",
                    "Marketing and Distribution: Designing comprehensive marketing strategies for local growth.",
                    "Logistics Services: Management of supply chains, warehousing, and customs clearance.",
                    "Brand Management: Protecting and enhancing brand reputation in the local market."
                ]
            },
            {
                title: "Core Values",
                body: "Reliability, Professionalism, Transparency, and Innovation are the pillars of all our operations."
            }
        ]
    },
    {
        id: "al_arabiya_international",
        name: "Al-Arabiya International",
        description: "Innovation and Investment group based in UAE.",
        introduction: "Al-Arabiya International is a leading company founded in the heart of the United Arab Emirates, embodying the spirit of innovation and entrepreneurship that defines the UAE economy. The company was established with a bold vision to serve as a bridge for commercial and investment excellence between the Arab world and the rest of the globe.",
        logo: "/logos/Blue-Ocean.png",
        meshNames: ["door15"],
        beaconPosition: [-13.37, 54, -23.16], // Tier4
        doorModel: "PWR4",
        website: "https://alarabiya-international.com",
        content: [
            {
                title: "Vision",
                body: "To be the preferred global partner in providing integrated solutions that foster economic growth and build a sustainable future through leadership, integrity, and quality."
            },
            {
                title: "Main Business Areas",
                list: [
                    "Real Estate Investment and Development: Residential and commercial projects and portfolio management.",
                    "Management and Financial Consulting: Digital transformation and economic feasibility studies.",
                    "Logistics and Trade Services: Global supply chain management and international trade brokerage.",
                    "Technology and Innovation: AI, data analytics, and software development solutions."
                ]
            },
            {
                title: "Social Responsibility",
                body: "The group actively engages in youth training, environmental sustainability, and support for SMEs, contributing to community development."
            }
        ]
    },
    {
        id: "al_zawraa",
        name: "Al-Zawraa Company",
        description: "Media and Broadcast conglomerate.",
        introduction: "Al-Zawraa Company was established in 2005 in Baghdad as a pioneering, full-service media and advertising institution. The company began its journey with a local radio station and expanded over the years to become one of the most prominent media groups in Iraq and the region.",
        logo: "/logos/Al-Zawraa.png",
        meshNames: ["door26"],
        beaconPosition: [-13.37, 54, 23.16], // Tier4
        doorModel: "SP1",
        website: "https://alzawraa.com",
        content: [
            {
                title: "Broadcasting and Digital Platforms",
                list: [
                    "Television Channels: Al-Zawraa TV (General), Al-Zawraa Drama, Al-Zawraa News.",
                    "Radio Stations: Al-Zawraa FM and Holy Quran Radio.",
                    "Digital Platforms: Live streaming and smart application content production."
                ]
            },
            {
                title: "Advertising and Marketing Services",
                list: [
                    "Integrated Campaigns: Planning and execution across all digital and traditional platforms.",
                    "Outdoor Advertising: Strategic billing and transportation ads.",
                    "Event Management: Organizing conferences, festivals, and exhibitions.",
                    "Publishing: Al-Zawraa Cultural Magazine and digital blogging platforms."
                ]
            },
            {
                title: "Strategic Vision",
                body: "To be the professional reference in creative content production that enriches society while preserving Iraqi cultural identity with authenticity and modernity."
            }
        ]
    },
    {
        id: "al_tawasul",
        name: "Al-Tawasul",
        description: "Economic Services and Strategic Consulting.",
        introduction: "Al-Tawasul Economic Services Company is a specialized Iraqi economic entity established in 2023 in accordance with the provisions of Article (22) of the Iraqi Companies Law No. (21) of 1997, as amended. The company provides integrated economic and consulting solutions to both the public and private sectors. Al-Tawasul operates within a strict Iraqi legal framework and relies on a team of experts and specialists across various economic disciplines.",
        logo: "/logos/Al-Mutamayez.png",
        meshNames: ["door11"],
        beaconPosition: [0, 8, 48], // Tier1
        doorModel: "SP3",
        website: "https://altawasul.com",
        content: [
            {
                title: "Strategic Areas of Operation",
                list: [
                    "Economic Consulting: Macro/Micro indicators and feasibility studies.",
                    "Financial & Banking: Financing structures and risk assessment.",
                    "Investment Services: Identification of promising opportunities and portfolio management.",
                    "Macro Research: Market competitiveness and sustainability studies."
                ]
            },
            {
                title: "Competitive Advantages",
                list: [
                    "Deep Local Expertise: In-depth understanding of the Iraqi economic environment.",
                    "Specialized Competencies: Team of Iraqi experts and international consultants.",
                    "Scientific Methodology: Application of internationally recognized research standards."
                ]
            },
            {
                title: "Vision",
                body: "To become the leading reference for integrated economic solutions in Iraq and an active contributor to national economic development through professionalism and integrity."
            }
        ]
    },
    {
        id: "dazly",
        name: "Dazly",
        description: "General Trading & E-Commerce Company.",
        introduction: "Dazly was established as an ambitious venture aiming to redefine the concept of e-commerce and general trading by combining variety, quality, and an outstanding user experience. We are more than just an online marketplace; we are a trusted partner that meets the needs of individuals and families across all aspects of daily life.",
        logo: "/logos/Al-Rayyan.png",
        meshNames: ["door27"],
        beaconPosition: [26.87, 27, 26.87], // Tier2
        doorModel: "SP4",
        website: "https://dazly.com",
        content: [
            {
                title: "Business Scope",
                list: [
                    "Consumer Goods: Online supermarket for food and personal care.",
                    "Electronics: Smartphones, tablets, and smart home devices.",
                    "Fashion: Apparel and accessories for all ages.",
                    "Home & Décor: Furniture and kitchenware.",
                    "Health & Beauty: Curated wellness products."
                ]
            },
            {
                title: "The Digital Experience",
                body: "Our platform offers intuitive design, smart search, secure payments (including Cash on Delivery and Digital Wallets), and advanced order tracking for a seamless shopping journey."
            },
            {
                title: "Competitive Edge",
                body: "By working with certified suppliers and maintaining smart warehouses, Dazly ensures fast delivery and exceptional value through a unique blend of global standards and local expertise."
            }
        ]
    },
    {
        id: "arkan_al_dar",
        name: "Arkan Al-Dar",
        description: "Marketing and Tourism Investment group.",
        introduction: "Arkan Al-Dar is a leading multi-activity company providing integrated solutions in commercial marketing, advertising, and tourism investments. Established in 2015, the company was founded with an ambitious vision that blends innovation with tradition, positioning itself as a strategic partner for success in both local and regional markets. The company adopts the philosophy of “The Integrated Pillar,” combining excellence in creative services with smart investment solutions.",
        logo: "/logos/Golden-Sand.png",
        meshNames: ["door13"],
        beaconPosition: [0, 8, -48], // Tier1
        doorModel: "OP1",
        website: "https://arkan-aldar.com",
        content: [
            {
                title: "Main Business Areas",
                list: [
                    "Integrated Marketing: Strategic planning, digital marketing, and brand management.",
                    "Advertising Services: Creative design, multimedia production, and event management.",
                    "Tourism Investments: Development and management of hotels, resorts, and sustainable tourism projects."
                ]
            },
            {
                title: "Key Projects",
                list: [
                    "Arkan Oasis Tourism Resort",
                    "Dar Al-Diyafa Hotel Management",
                    "Heritage Route Cultural Tourism Project"
                ]
            },
            {
                title: "Core Values",
                body: "Creativity, Excellence, Partnership, and Social Responsibility guided by an integrated approach that saves clients time and effort."
            }
        ]
    },
    {
        id: "ameer_al_middle_east",
        name: "Ameer Al-Middle East",
        description: "Events, Advertising, and Catering specialists.",
        introduction: "Ameer Al-Middle East Company is a private Iraqi limited liability company specializing in delivering an integrated package of technical, organizational, and logistical services across the fields of events management, marketing, and food services. The company was officially established and obtained its legal license from the relevant Iraqi authorities, positioning itself as a trusted partner in managing major events and occasions, as well as executing marketing and advertising campaigns with high efficiency and professionalism.",
        logo: "/logos/Al-Tafani.png",
        meshNames: ["door25"],
        beaconPosition: [-26.87, 27, -26.87], // Tier2
        doorModel: "OP3",
        website: "https://ameer-middleeast.com",
        content: [
            {
                title: "Main Services",
                list: [
                    "Event Organization: Planning and execution of exhibitions, conferences, and seminars.",
                    "Advertising & Promotion: Comprehensive campaigns, public relations, and visual identity design.",
                    "Catering & Hospitality: Provision of banquet services, cafeterias, and hospitality solutions for corporate events."
                ]
            },
            {
                title: "Legal Structure",
                body: "As a Private Limited Liability Company, we are legally equipped to deliver services throughout Iraq, acting as a trusted partner for large-scale projects and exhibitions."
            }
        ]
    },
    {
        id: "al_tamaddon",
        name: "Al-Tamaddon Real Estate",
        description: "Urban investment and development (1 Billion IQD Capital).",
        introduction: "Al-Tamaddon Company for Real Estate Investment and Development is a private Iraqi limited liability company, officially registered with the Ministry of Trade – Companies Registration Department. The company was established with a capital of one billion Iraqi dinars, reflecting its financial strength and firm commitment to actively contributing to the development of the real estate investment sector in Iraq.",
        logo: "/logos/Al-Jawda.png",
        meshNames: ["door15"],
        beaconPosition: [-48, 8, 0], // Tier1
        doorModel: "OP4",
        website: "https://altamaddon.com",
        content: [
            {
                title: "Core Activities",
                list: [
                    "Residential Projects: Design and execution of modern complexes.",
                    "Commercial Projects: Development of shopping centers and administrative offices.",
                    "Consultancy: Real estate feasibility studies and investment advisory.",
                    "Property Management: Professional operation of completed assets."
                ]
            },
            {
                title: "Vision",
                body: "To be a leading company in real estate development in Iraq, focusing on quality, innovation, and sustainability across all urban infrastructure projects."
            }
        ]
    },
    {
        id: "imkanat",
        name: "Imkanat Development",
        description: "Sustainability and Green Transformation pioneer.",
        introduction: "Imkanat Development Company was established as an ambitious national enterprise aiming to actively contribute to urban, economic, and service-sector development. We do not provide isolated services; rather, we operate as an integrated system that connects all stages of development—from concept to operation and management.\n\nIn the heart of Baghdad, where civilization and history intersect with the challenges of the modern era, Imkanat Development emerges with a revolutionary vision that redefines real estate investment and urban development. Our flagship project, “Sustainable Forests in Baghdad,” stands as a practical declaration of our commitment to building a green and sustainable future for Iraq.",
        logo: "/logos/Imkanat.png",
        meshNames: ["door14"],
        beaconPosition: [-17.39, 67, -4.66], // Tier5
        doorModel: "PWR1",
        website: "https://imkanat.com",
        content: [
            {
                title: "Vision and Mission",
                list: [
                    "General Trading: Supply of construction and industrial materials.",
                    "Public Transportation: Modern and safe logistical fleet.",
                    "General Contracting: Urban development and management of major projects.",
                    "Real Estate Investment: Strategic land acquisition and portfolio management."
                ]
            },
            {
                title: "Sustainable Forests in Baghdad",
                body: "Our flagship project features green infrastructure, rainwater reuse, smart community spaces, and low-density residential units with solar energy and thermal insulation, promoting a healthy environment for future generations."
            }
        ]
    },
    {
        id: "baghdad_wings",
        name: "Baghdad Wings Airline",
        description: "Iraq's private airline and air cargo service.",
        introduction: "Baghdad Wings Airline – LLC was established as a private aviation company aiming to provide high-quality commercial aviation and air cargo services, with a strong focus on connecting Iraq with regional and international destinations. We operate with the authentic spirit of Iraq and a modern aviation vision, contributing to rebuilding Iraq’s image as a key logistical and aviation hub in the region.",
        logo: "/logos/Baghdad-Wings.png",
        meshNames: ["door16"],
        beaconPosition: [10.24, 44, 28.19], // Tier3
        doorModel: "PWR3",
        website: "https://baghdadwings.com",
        content: [
            {
                title: "Operational Sectors",
                list: [
                    "Commercial Aviation: Scheduled flights with Economy and Business Class services.",
                    "Air Cargo: Reliable and fast cargo services for goods and documents.",
                    "Ground Handling: Managing airport check-in, baggage, and ground logistics.",
                    "Tourism: Integrated packages in cooperation with global travel agencies."
                ]
            },
            {
                title: "Safety and Quality",
                body: "We fly with confidence, adhering to the highest international safety standards while representing Iraq's heritage through premium hospitality and modern fleet efficiency."
            }
        ]
    },
    {
        id: "inmobiles",
        name: "INMOBILES - FZCO",
        description: "Mobile technology and telecommunications branch.",
        introduction: "INMOBILES – FZCO is a foreign company registered in the United Arab Emirates and has obtained an official license to establish a branch in the Republic of Iraq pursuant to a decision issued by the Iraqi Ministry of Trade – Companies Registration Department – Foreign Companies Section. This license reflects the company’s commitment to strategic expansion and investment in the Iraqi market, in full compliance with applicable legal and regulatory frameworks.",
        logo: "/logos/INMOBILES - FZCO.png",
        meshNames: ["door12"],
        beaconPosition: [48, 8, 0], // Tier1
        doorModel: "PWR4",
        website: "https://inmobiles.com",
        content: [
            {
                title: "Main Business Activities",
                list: [
                    "Distribution: Import and sale of smartphones and electronic accessories.",
                    "Technical Support: Provision of after-sales service and maintenance.",
                    "Marketing: Digital solutions and exclusive agency representation for global brands.",
                    "Logistics: Supply chain management and smart storage systems."
                ]
            },
            {
                title: "Vision",
                body: "To be the leading technology partner in Iraq, expanding access to modern products while adhering to international standards of quality and efficiency."
            }
        ]
    },
    {
        id: "iraqi_insurance",
        name: "Iraqi Insurance Union",
        description: "Foundational pillar of Iraq's insurance sector.",
        introduction: "Iraqi Insurance Union is one of the historic and foundational pillars of Iraq’s insurance sector. Established on principles that combine heritage and modernity, it has become a leading company providing comprehensive insurance solutions that protect individuals, businesses, and assets. We are not just a company selling insurance policies; we are a true partner in your life and success, building a protective shield that preserves your achievements and eases your concerns about the future.",
        logo: "/logos/Al-Asriya.png",
        meshNames: ["door22"],
        beaconPosition: [-26.87, 27, 26.87], // Tier2
        doorModel: "SP1",
        website: "https://iraqiinsurance.com",
        content: [
            {
                title: "Insurance Portfolios",
                list: [
                    "Personal & Health: Life, medical network, and personal accident coverage.",
                    "Property & Risks: Fire, theft, vehicle, and engineering risk insurance.",
                    "Commercial: Employee liability, cash in transit, and investment portfolios.",
                    "Specialized: Hajj & Umrah protection for Iraqi citizens."
                ]
            },
            {
                title: "Why Choose Us?",
                body: "Our historical reputation for fair claims settlement, financial stability, and global reinsurance partnerships ensures maximum security for our clients."
            }
        ]
    },
    {
        id: "himmati",
        name: "HIMMATI",
        description: "General Trading Company.",
        introduction: "HIMMATI General Trading Company was founded on a simple yet powerful principle: to be a trustworthy commercial partner dedicated to achieving the ambitions of its clients and partners with seriousness and integrity. The name “HIMMATI” reflects a spirit of commitment and high ambition in every transaction, deal, and business relationship, serving as a bridge between local and global markets, and turning ideas into reality with efficiency and transparency.",
        logo: "/logos/Al-Furaat.png",
        meshNames: ["door23"],
        beaconPosition: [26.87, 27, -26.87], // Tier2
        doorModel: "SP3",
        website: "https://himmati.com",
        content: [
            {
                title: "Business Scope",
                list: [
                    "Import/Export: Food, construction materials, and household appliances.",
                    "Distribution: Nationwide network covering cooperatives and hypermarkets.",
                    "Contracts: Supplying materials to government and private institutions.",
                    "E-Commerce: B2B platform for specialized trader services."
                ]
            },
            {
                title: "Service Strength",
                body: "With a global network of approved factories and a specialized logistics team, HIMMATI provides high-quality products at competitive prices with full financial transparency."
            }
        ]
    }
];
