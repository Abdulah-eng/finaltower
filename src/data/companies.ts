export interface Company {
    id: string;
    name: string;
    description: string;
    fullDescription?: string;
    logo: string;
    meshNames: string[];
    website?: string;
    content?: {
        title?: string;
        body: string | string[];
        list?: string[];
    }[];
}

export const companies: Company[] = [
    {
        id: "arabian_holding_group",
        name: "Arabian Holding Group – Iraq",
        description: "A Driver of Development and a Symbol of Trust.",
        fullDescription: "Arabian Holding Group is one of Iraq's leading companies...",
        logo: "/logos/Arabian Holding Group – Iraq.png",
        meshNames: ["door upper11", "door upper11.001", "door upper11.002", "door upper11.003"],
        website: "https://arabianholdinggroup.com",
        content: [
            {
                title: "A Driver of Development and a Symbol of Trust",
                body: "Arabian Holding Group is one of Iraq’s leading companies, officially registered with the Ministry of Trade. It was established in 2005 in accordance with Article 21 of the Companies Law No. (21) of 1997. The Group operates with strengthened capital, reflecting its financial solidity and its capability to execute major strategic projects across Iraq.\nThe Group is guided by a clear vision focused on business development and the creation of effective partnerships across various sectors, with full commitment to professional and legal standards. It enhances client confidence by delivering high-quality services and projects that have a tangible economic and developmental impact."
            },
            {
                title: "About the Group",
                body: "At the heart of Iraq’s evolving business environment, Arabian Holding Group stands out as an active economic and investment entity and a strategic partner in the journey of construction and development. Founded on an ambitious vision and a solid legacy of credibility, the Group serves as a bridge between Iraq’s promising potential and global best practices, contributing to the shaping of a sustainable economic future.\nThe Group adopts a business model based on diversification, innovation, and sustainability. Its investments go beyond projects alone to include investment in people and the national economy, through a diversified portfolio of vital sectors that contribute to infrastructure development and improved quality of life."
            },
            {
                title: "Our Business Sectors",
                body: "Diversity That Supports the National Economy\nOur subsidiaries and specialized branches operate across several key development sectors, including:",
                list: [
                    "Energy and Infrastructure: Investment in conventional and renewable energy projects, the oil and gas sector, and the development of essential infrastructure.",
                    "Real Estate and Construction: Development of integrated residential, commercial, and service projects in accordance with the latest international standards of design and quality.",
                    "Industry and Agriculture: Supporting the industrial sector through manufacturing projects and strengthening agriculture to contribute to food security.",
                    "Trade and Distribution: Partnerships and representation of global brands in automobiles, equipment, technology, and consumer goods, supported by a wide distribution network.",
                    "Financial and Investment Services: Providing specialized investment solutions and advisory services, and contributing to the development of the financial sector.",
                    "Telecommunications and Technology: Investment in digital infrastructure and modern technological services, supporting Iraq’s digital transformation journey."
                ]
            },
            {
                title: "Our Values",
                body: "The Foundation of Your Trust\nAll our operations are built upon a solid set of values, including:",
                list: [
                    "Commitment and Reliability: Fulfilling promises and building long-term relationships with partners and clients.",
                    "Quality and Excellence: Applying the highest standards in planning, execution, and service delivery.",
                    "Innovation and Development: Adopting innovative solutions and modern technologies to keep pace with the future.",
                    "Social Responsibility: Actively contributing to the support of education, healthcare, and environmental initiatives.",
                    "National Partnership: Acting as a strategic partner to both the public and private sectors, with the belief that our growth is inseparable from Iraq’s growth."
                ]
            },
            {
                title: "Our Vision for the Future",
                body: "Arabian Holding Group is not merely a company, but a coalition of expertise and visions dedicated to serving Iraq and building its economy. We welcome all constructive partnership opportunities with global investors, local companies, government institutions, and ambitious Iraqi talents.\nLet us build a brighter future together.\nArabian Holding Group – Iraq\nPartners in Development… Committed to Trust"
            }
        ]
    },
    {
        id: "mawaraa_al_bihar",
        name: "Mawaraa Al-Bihar General Trading",
        description: "Comprehensive trading and commercial agencies.",
        logo: "/logos/Mawaraa Al-Bihar General Trading & Commercial Agencies Ltd..png",
        meshNames: ["door upper12"],
        website: "https://mawaraa-albihar.com",
        content: [
            {
                title: "Comprehensive Overview",
                body: "Mawaraa Al-Bihar General Trading & Commercial Agencies Ltd. is a private Iraqi company officially registered with the Ministry of Trade – Companies Registration Directorate of the Republic of Iraq. The company was established with a capital of IQD 100,000,000 (one hundred million Iraqi dinars), qualifying it to conduct general trading and commercial agency activities at both the local and international levels, in accordance with approved legal and professional frameworks."
            },
            {
                title: "Basic Company Information",
                body: "",
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
                    "First: General Trading — Import and export of goods and commodities of various types; Conducting domestic trade and distributing consumer and industrial products; Organizing and managing wholesale and retail buying and selling operations based on professional commercial principles.",
                    "Second: Commercial Agencies — Representing international companies and manufacturers and obtaining exclusive commercial agencies within Iraq; Marketing, distributing, and selling the products of the companies it represents; Providing after-sales services and technical support in accordance with approved standards."
                ]
            },
            {
                title: "Vision and Mission",
                body: "Our Vision: To be among the leading companies in the field of general trading and commercial agencies in Iraq and the region, by building strong business networks and creating sustainable added value for clients and partners.\nOur Mission: To deliver integrated and reliable commercial solutions based on product and service quality, while adhering to the highest standards of integrity, efficiency, and professionalism in all commercial transactions."
            },
            {
                title: "Our Core Values",
                body: "",
                list: [
                    "Trust: Building long-term relationships with clients, suppliers, and partners.",
                    "Quality: Ensuring the selection of products and services that meet the highest standards.",
                    "Transparency: Commitment to clarity and honesty in all dealings.",
                    "Innovation: Adopting modern business methods and advanced technologies to keep pace with market developments."
                ]
            },
            {
                title: "Our Services",
                body: "Mawaraa Al-Bihar provides a comprehensive range of commercial services, including:",
                list: [
                    "Import and Export Services: Managing and facilitating cross-border commercial and logistics operations.",
                    "Local Distribution: An efficient distribution network covering various Iraqi provinces.",
                    "Exclusive Agencies: Representation of global brands across multiple sectors.",
                    "Commercial Consulting: Market studies and investment opportunity analysis.",
                    "Logistics Support: Oversight of shipping, customs clearance, and warehousing operations."
                ]
            },
            {
                title: "Conclusion",
                body: "Mawaraa Al-Bihar General Trading & Commercial Agencies Ltd. represents a reliable commercial partner in the Iraqi market, supported by comprehensive legal, administrative, and logistical expertise. The company actively contributes to supporting the national economy by opening organized import and export channels, representing leading brands, and delivering sustainable commercial solutions that meet market needs."
            }
        ]
    },
    {
        id: "al_irtikaz",
        name: "Al-Irtikaz Company",
        description: "Artistic production, marketing, and technical services.",
        logo: "/logos/Al-Irtikaz Company.png",
        meshNames: ["door upper13"],
        website: "https://alirtikaz.com",
        content: [
            {
                title: "Overview",
                body: "Al-Irtikaz Company is a fully integrated Iraqi commercial entity, officially established under registered documentation with the Iraqi Ministry of Trade – Companies Registration Directorate. The company adopts a multi-dimensional business model that combines artistic production, marketing, publishing, and technical services under one umbrella, delivering integrated solutions to its clients."
            },
            {
                title: "Areas of Specialization and Services",
                body: "",
                list: [
                    "Artistic Production and Distribution: Production of artistic and creative works of all types; Distribution of artistic products through available channels; Supporting local talents and creative content creators.",
                    "Advertising, Publishing, and Promotion: Design and execution of integrated advertising campaigns; Provision of print and digital publishing services; Strategic advertising planning for brands; Management of social media accounts and digital platforms.",
                    "Technical and Professional Service: Professional and artistic photography services; Electronic management solutions and digital business management; Post-production services for visual and media content."
                ]
            },
            {
                title: "Vision and Mission",
                body: "Vision: To be a fundamental pillar in advancing the creative and media industry in Iraq by delivering integrated solutions that combine artistic authenticity with modern technologies.\nMission: To provide high-quality production, media, and technical services that contribute to the development of Iraq’s advertising and artistic landscape, while maintaining full compliance with professional and legal standards."
            },
            {
                title: "Core Values",
                body: "",
                list: [
                    "Legal Compliance: Operating strictly within approved Iraqi regulatory frameworks.",
                    "Creativity and Innovation: Delivering innovative artistic and advertising solutions.",
                    "Integration: Offering a comprehensive service package under one roof.",
                    "Professionalism: Adhering to the highest standards of quality and performance efficiency.",
                    "Technological Advancement: Utilizing the latest management, photography, and production technologies."
                ]
            }
        ]
    },
    {
        id: "nidaa_al_ard",
        name: "Nidaa Al-Ard Company",
        description: "Agricultural investments and general trading.",
        logo: "/logos/Nidaa Al-Ard Company.png",
        meshNames: ["door upper14"],
        website: "https://nidaa-alard.com",
        content: [
            {
                title: "Introduction",
                body: "Nidaa Al-Ard Company is a leading Iraqi entity specializing in agricultural investments, general trading, import and export of agricultural materials and fertilizers, livestock and agricultural wealth investments, advanced agricultural services, trading of agricultural supplies and equipment, as well as the trade of crops, fertilizers, and pesticides. The company is established as a Limited Liability Company (LLC).\nThe company was founded in 2024 to deliver innovative, high-quality solutions that meet the needs of local and regional markets, while contributing to the development of the agricultural sector on scientific and sustainable foundations."
            },
            {
                title: "A New Vision for Modern Agriculture",
                body: "In light of the rapid transformations occurring in the agricultural sector, Nidaa Al-Ard Company seeks to lead the future of modern agriculture by adopting an advanced scientific approach represented by the establishment of a state-of-the-art Agricultural Genetics Laboratory as part of its infrastructure. This strategic direction represents a qualitative shift from traditional agriculture toward smart agriculture based on biotechnology and scientific research."
            },
            {
                title: "Components of the Integrated Laboratory",
                body: "",
                list: [
                    "Core Laboratory Units: Genetic Analysis Unit, Tissue Culture Unit, Molecular Diagnostics Unit, Genetic Sample Storage Unit.",
                    "Advanced Technical Equipment: PCR systems, Genetic sequencing equipment, Sterile tissue culture laboratories, Genetic data analysis systems."
                ]
            },
            {
                title: "Expected Benefits",
                body: "",
                list: [
                    "Technical Benefits: Development of high-quality crop varieties, reduction of new variety development time, improved quality and market value, creation of a unique genetic library.",
                    "Economic Benefits: Increase in productivity by 30-40%, reduction of production costs, diversification of revenue streams.",
                    "Environmental Benefits: Reduction of carbon footprint, rationalization of water usage, support for sustainable agriculture."
                ]
            }
        ]
    },
    {
        id: "al_takween",
        name: "Al-Takween Commercial Agencies",
        description: "Your trusted partner in commercial agencies and marketing.",
        logo: "/logos/Al-Takween Commercial Agencies Company.png",
        meshNames: ["door2 upper", "door2 upper.001", "door2 upper.002", "door2 upper.003", "door2 upper.004", "door2 upper.005", "door2 upper.006"],
        website: "https://altakween.com",
        content: [
            {
                title: "Establishment and Legal Identity",
                body: "Al-Takween Commercial Agencies Company (LLC) was established in accordance with the provisions of the Iraqi Companies Law No. (21) of 1997 and the Commercial Agencies Regulation Law No. (79) of 2017. The official certificate of incorporation was issued on November 1, 2023, with an authorized capital of one hundred million Iraqi dinars."
            },
            {
                title: "Vision and Mission",
                body: "Vision: To become the leading company in the field of commercial agencies and marketing in Iraq and the region, by building strong local and international strategic partnerships and delivering integrated commercial solutions that meet client needs.\nMission: To represent international and local companies in the Iraqi market through exclusive agencies, and to provide marketing, logistics, and consulting services in accordance with the highest standards of quality and efficiency."
            },
            {
                title: "Core Business Areas and Services",
                body: "",
                list: [
                    "Exclusive Commercial Agencies: Representation of global brands across various sectors, including food products, pharmaceuticals, medical supplies, electrical and electronic appliances, construction materials, and others.",
                    "Marketing and Distribution: Designing and executing comprehensive marketing strategies and managing both traditional and modern distribution channels.",
                    "Logistics Services: Management of supply chains, warehousing, transportation, and customs clearance.",
                    "Commercial and Legal Consultancy: Assisting companies with registration procedures, licensing, and compliance with Iraqi laws.",
                    "Brand Management: Protecting brand identity and enhancing brand reputation."
                ]
            },
            {
                title: "Why Choose Al-Takween?",
                body: "",
                list: [
                    "Officially registered and licensed by the Iraqi Companies Registration Directorate.",
                    "Strong capital base enabling engagement in major projects.",
                    "In-depth knowledge of the Iraqi market and regulatory procedures.",
                    "An extensive network of relationships with government entities and the private sector.",
                    "An experienced administrative and technical team in commercial agencies and trade."
                ]
            }
        ]
    },
    {
        id: "al_arabiya_international",
        name: "Al-Arabiya International",
        description: "Your trusted partner in innovation and investment.",
        logo: "/logos/Al-Arabiya International company.png",
        meshNames: ["door27"],
        website: "https://alarabiya-international.com",
        content: [
            {
                title: "Company Overview",
                body: "Al-Arabiya International is a leading company founded in the heart of the United Arab Emirates, embodying the spirit of innovation and entrepreneurship that defines the UAE economy. The company was established with a bold vision to serve as a bridge for commercial and investment excellence between the Arab world and the rest of the globe."
            },
            {
                title: "Vision and Mission",
                body: "Vision: To be the preferred global partner in providing integrated solutions that foster economic growth and build a sustainable future.\nMission: To deliver innovative, high-quality services and solutions that meet client expectations and contribute to sustainable growth in the communities where we operate."
            },
            {
                title: "Main Business Areas",
                body: "",
                list: [
                    "Real Estate Investment and Development: Development of integrated residential and commercial projects; Management of real estate investment portfolios.",
                    "Management and Financial Consulting: Business digital transformation consultancy; Strategic planning; Preparation of economic feasibility studies.",
                    "Logistics and Trade Services: Global supply chain management; Customs clearance services; International trade brokerage.",
                    "Technology and Innovation: Digital transformation solutions; Application and software development; AI and data analytics services."
                ]
            },
            {
                title: "Social Responsibility",
                body: "Al-Arabiya International actively engages in serving society through youth training and employment programs, environmental sustainability initiatives, support for SMEs, and participation in charitable and humanitarian work."
            }
        ]
    },
    {
        id: "al_zawraa",
        name: "Al-Zawraa Company",
        description: "Audio-visual broadcasting, advertising, and publishing.",
        logo: "/logos/Al-Zawraa Company for Audio-Visual Broadcasting, Advertising, Publishing, Distribution, and Marketing.png",
        meshNames: ["door17"],
        website: "https://alzawraa.com",
        content: [
            {
                title: "Establishment and Identity",
                body: "Al-Zawraa Company was established in 2005 in Baghdad as a pioneering, full-service media and advertising institution. The company began its journey with a local radio station and expanded over the years to become one of the most prominent media groups in Iraq and the region."
            },
            {
                title: "Vision",
                body: "To be the leading media destination in Iraq and the professional reference in creative content production that enriches society and conveys Iraq’s cultural and civilizational image to the world."
            },
            {
                title: "Areas of Work and Services",
                body: "",
                list: [
                    "Audio and Visual Broadcasting: Al-Zawraa TV, Al-Zawraa Drama, Al-Zawraa News; Radio Stations (Al-Zawraa FM); Digital Broadcasting.",
                    "Advertising and Publishing: Print Publishing (Al-Zawraa Cultural Magazine); Digital Publishing; Content Management.",
                    "Distribution: Media Product Distribution; Logistics Network covering all Iraqi governorates.",
                    "Advertising and Marketing: Integrated Advertising Campaigns; Outdoor Advertising; Digital Marketing; Event Management."
                ]
            },
            {
                title: "Key Projects",
                body: "Media Projects include 'Memory of a Nation' award-winning documentary program and 'Read to Succeed' campaign. Advertising Projects include National domestic tourism campaign 'Discover the Beauty of Iraq'."
            }
        ]
    },
    {
        id: "al_tawasul",
        name: "Al-Tawasul Economic Services",
        description: "Your strategic partner in economic development.",
        logo: "/logos/Al-Tawasul Economic Services Company.png",
        meshNames: ["door11"],
        website: "https://altawasul.com",
        content: [
            {
                title: "Overview",
                body: "Al-Tawasul Economic Services Company is a specialized Iraqi economic entity established in 2023. The company provides integrated economic and consulting solutions to both the public and private sectors. Al-Tawasul operates within a strict Iraqi legal framework and relies on a team of experts and specialists."
            },
            {
                title: "Strategic Areas of Operation",
                body: "",
                list: [
                    "Economic Consulting Services: Analysis of macroeconomic and microeconomic indicators; Preparation of economic feasibility studies; Financial and investment advisory.",
                    "Financial and Banking Services: Banking and financial consulting; Analysis of financing structures; Strategic financial planning.",
                    "Investment and Development Services: Identification of promising investment opportunities; Design of economic business models.",
                    "Economic Research and Studies: Market and sector research; Competitiveness and sustainability studies."
                ]
            },
            {
                title: "Competitive Advantages",
                body: "Deep Local Expertise with in-depth understanding of the Iraqi economic environment; Specialized Competencies with a team of experienced Iraqi and international consultants; Scientific Methodology applying internationally recognized research methods."
            }
        ]
    },
    {
        id: "dazly",
        name: "Dazly General Trading",
        description: "Your gateway to smart and comprehensive shopping.",
        logo: "/logos/Dazly General Trading & E-Commerce Company.png",
        meshNames: ["door12"],
        website: "https://dazly.com",
        content: [
            {
                title: "Executive Summary",
                body: "Dazly was established as an ambitious venture aiming to redefine the concept of e-commerce and general trading by combining variety, quality, and an outstanding user experience. We are more than just an online marketplace; we are a trusted partner that meets the needs of individuals and families across all aspects of daily life."
            },
            {
                title: "Business Scope",
                body: "Dazly offers a comprehensive general trading model that includes Consumer goods & online supermarket, Electronics & accessories, Fashion & apparel, Home & décor products, Health & beauty products, and Sports & hobby supplies."
            },
            {
                title: "The Digital Platform & User Experience",
                body: "Features include a clean and intuitive design, smart search and precise categorization, multiple secure payment options (Cash on delivery, credit cards, digital wallets), an advanced order tracking system, and a user-friendly mobile application."
            },
            {
                title: "Competitive Advantages",
                body: "All-in-one platform; Unique blend of open marketplace and specialized stores; Trust & transparency; Smooth user experience; Local expertise with global standards."
            }
        ]
    },
    {
        id: "arkan_al_dar",
        name: "Arkan Al-Dar Company",
        description: "An integrated pillar for marketing and tourism investment.",
        logo: "/logos/Arkan Al-Dar Company.png",
        meshNames: ["door13"],
        website: "https://arkan-aldar.com",
        content: [
            {
                title: "Company Overview",
                body: "Arkan Al-Dar is a leading multi-activity company providing integrated solutions in commercial marketing, advertising, and tourism investments. Established in 2015, the company was founded with an ambitious vision that blends innovation with tradition, positioning itself as a strategic partner for success."
            },
            {
                title: "Main Business Areas",
                body: "",
                list: [
                    "Integrated Commercial Marketing: Strategic Planning, Digital Marketing, Creative Traditional Marketing, Market Research, Brand Management.",
                    "Comprehensive Advertising Services: Creative Design, Multimedia Production, Event Management, Outdoor Advertising.",
                    "Advanced Tourism Investments: Tourism Project Development, Tourism Facility Management, Sustainable Tourism Investment, Medical & Leisure Tourism."
                ]
            },
            {
                title: "Key Projects",
                body: "Marketing Projects include launch campaigns for local brands and visual identity development. Tourism Investments include 'Arkan Oasis' Tourism Resort, 'Dar Al-Diyafa' Hotel, and 'Heritage Route' Cultural Tourism Project."
            }
        ]
    },
    {
        id: "ameer_al_middle_east",
        name: "Ameer Al-Middle East",
        description: "Exhibitions, conferences, advertising, and catering.",
        logo: "/logos/Ameer Al-Middle East Company.png",
        meshNames: ["door14"],
        website: "https://ameer-middleeast.com",
        content: [
            {
                title: "Overview",
                body: "Ameer Al-Middle East Company is a private Iraqi limited liability company specializing in delivering an integrated package of technical, organizational, and logistical services across the fields of events management, marketing, and food services. The company was officially established and obtained its legal license from the relevant Iraqi authorities."
            },
            {
                title: "Main Fields & Services",
                body: "",
                list: [
                    "Event Organization & Management: Full planning and execution of commercial and specialized exhibitions; Organization of conferences usually."
                ]
            }
        ]
    },
    {
        id: "al_tamaddon",
        name: "Al-Tamaddon Real Estate",
        description: "Real estate investment and development.",
        logo: "/logos/Al-Tamaddon Company for Real Estate Investment and Development.png",
        meshNames: ["door15"],
        website: "https://altamaddon.com",
        content: [
            {
                title: "Introduction",
                body: "Al-Tamaddon Company for Real Estate Investment and Development is a private Iraqi limited liability company, officially registered with the Ministry of Trade. The company was established with a capital of one billion Iraqi dinars, reflecting its financial strength."
            },
            {
                title: "Company Services",
                body: "",
                list: [
                    "Residential Project Development: Design and execution of modern, integrated residential complexes.",
                    "Commercial Projects: Development of modern shopping centers and administrative offices.",
                    "Real Estate Consultancy: Providing feasibility studies and specialized investment consultancy.",
                    "Property Management: Operation and management of properties after project completion.",
                    "Integrated Urban Development: Projects that include infrastructure, service facilities, and public spaces."
                ]
            }
        ]
    },
    {
        id: "imkanat",
        name: "Imkanat Development Company",
        description: "A pioneer of sustainability and green transformation.",
        logo: "/logos/Imkanat Development Company.png",
        meshNames: ["door16"],
        website: "https://imkanat.com",
        content: [
            {
                title: "Introduction",
                body: "Imkanat Development Company was established as an ambitious national enterprise aiming to actively contribute to urban, economic, and service-sector development. We operate as an integrated system that connects all stages of development—from concept to operation and management."
            },
            {
                title: "Integrated Business Sectors",
                body: "",
                list: [
                    "General Trading: Import and supply of construction materials.",
                    "Public Transportation and Logistics Solutions: Modern, safe fleet providing smart transport solutions.",
                    "General Contracting and Urban Development: Execution of residential and commercial projects.",
                    "Real Estate Investment and Development: Land acquisition and property development."
                ]
            },
            {
                title: "Flagship Project: 'Sustainable Forests' in Baghdad",
                body: "Features Green Infrastructure (rainwater drainage), Smart Community Spaces (walking paths), Low-Density Residential Units (sustainable villas), and an Environmental Community Center."
            }
        ]
    },
    {
        id: "baghdad_wings",
        name: "Baghdad Wings Airline",
        description: "We carry Baghdad to the world.",
        logo: "/logos/Baghdad Wings Airline.png",
        meshNames: ["door21"],
        website: "https://baghdadwings.com",
        content: [
            {
                title: "Establishment and Identity",
                body: "Baghdad Wings Airline – LLC was established as a private aviation company aiming to provide high-quality commercial aviation and air cargo services, with a strong focus on connecting Iraq with regional and international destinations."
            },
            {
                title: "Operational Sectors",
                body: "",
                list: [
                    "Commercial Aviation: Domestic, regional, and international flights.",
                    "Air Cargo: Fast and reliable cargo services.",
                    "Ground Handling Services: Airport ground services management.",
                    "Tourism and Travel: Integrated travel and tourism packages.",
                    "Aircraft Leasing: Providing aircraft for private charter."
                ]
            }
        ]
    },
    {
        id: "inmobiles",
        name: "INMOBILES – FZCO",
        description: "Leading mobile devices and technology sector.",
        logo: "/logos/INMOBILES – FZCO.png",
        meshNames: ["door22"],
        website: "https://inmobiles.com",
        content: [
            {
                title: "Introduction",
                body: "INMOBILES – FZCO is a foreign company registered in the United Arab Emirates and has obtained an official license to establish a branch in the Republic of Iraq. This license reflects the company’s commitment to strategic expansion and investment in the Iraqi market."
            },
            {
                title: "Main Business Activities",
                body: "",
                list: [
                    "Import and distribution of smartphones, tablets, and electronic devices.",
                    "Provision of after-sales services and maintenance.",
                    "Digital marketing and technical solutions related to mobile devices.",
                    "Contracting with global brands to obtain exclusive agency representation."
                ]
            }
        ]
    },
    {
        id: "iraqi_insurance",
        name: "Iraqi Insurance Union",
        description: "A trusted partner for decades.",
        logo: "/logos/Iraqi Insurance Union.png",
        meshNames: ["door23"],
        website: "https://iraqiinsurance.com",
        content: [
            {
                title: "Overview",
                body: "Iraqi Insurance Union is one of the historic and foundational pillars of Iraq’s insurance sector. Established on principles that combine heritage and modernity, it has become a leading company providing comprehensive insurance solutions that protect individuals, businesses, and assets."
            },
            {
                title: "Insurance Areas and Specialized Services",
                body: "",
                list: [
                    "Personal Insurance & Health Coverage: Life, Health, Personal Accident, and Travel Insurance.",
                    "Property and Engineering Risk Insurance: Fire, Vehicle, Transportation, and Engineering Insurance.",
                    "Corporate & Commercial Risk Insurance: Liability, Cash in transit, Professional indemnity.",
                    "Hajj & Umrah Insurance: Comprehensive protection for pilgrims."
                ]
            }
        ]
    },
    {
        id: "himmati",
        name: "HIMMATI General Trading",
        description: "With your determination… we realize your ambitions.",
        logo: "/logos/HIMMATI General Trading Company.png",
        meshNames: ["door24"],
        website: "https://himmati.com",
        content: [
            {
                title: "Introduction",
                body: "HIMMATI General Trading Company was founded on a simple yet powerful principle: to be a trustworthy commercial partner dedicated to achieving the ambitions of its clients and partners with seriousness and integrity."
            },
            {
                title: "Business Areas and Scope",
                body: "",
                list: [
                    "Import and Export of General Goods: Food, Construction Materials, Household Goods, FMCG.",
                    "Local Distribution and Marketing: Nationwide distribution network.",
                    "Government Contracts and Institutional Supply.",
                    "E-Commerce Services (B2B)."
                ]
            }
        ]
    }
];

export const getCompanyByMesh = (meshName: string) => {
    return companies.find(c => c.meshNames.some(targetName =>
        meshName === targetName || meshName.startsWith(`${targetName}.`)
    ));
};

export const getCompanyById = (id: string) => {
    return companies.find(c => c.id === id);
};
