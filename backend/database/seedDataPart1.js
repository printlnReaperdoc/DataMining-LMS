// Comprehensive Data Mining Curriculum Data and Assessment Questions
// Course: Data Mining (Elective 2) — ITEP411-T
// 4 Modules, 12 Chapters, each with rich lessons, slides, and 20 curriculum-aligned questions

const courseData = {
  code: 'ITEP411-T',
  title: 'Data Mining (Elective 2)',
  academicYearLevel: '4th Year',
  term: '1st Term (4-1)',
  classification: 'IT Professional Elective 2',
  description: 'A comprehensive university course covering foundational data preprocessing, pattern and association mining, supervised classification models, unsupervised clustering techniques, deep learning paradigms, anomaly detection, and contemporary research frontiers in data mining.'
};

const modulesData = [
  {
    moduleNumber: 1,
    title: 'Foundations and Preprocessing',
    description: 'Core concepts of knowledge discovery in databases, data measurement characteristics, cleaning and transformation techniques, and data warehousing architectures.'
  },
  {
    moduleNumber: 2,
    title: 'Pattern Mining and Association',
    description: 'Exploration of frequent itemsets, market basket analysis, the Apriori principle, FP-Growth trees, and quantitative association evaluation metrics.'
  },
  {
    moduleNumber: 3,
    title: 'Classification and Machine Learning',
    description: 'Supervised predictive modeling including decision tree induction, Bayesian classifiers, ensemble methods, support vector machines, and model evaluation metrics.'
  },
  {
    moduleNumber: 4,
    title: 'Clustering and Advanced Mining',
    description: 'Unsupervised partitioning, hierarchical and density-based clustering, deep neural architectures, outlier detection methodologies, and emerging frontiers.'
  }
];

const chaptersData = [
  // ===================== CHAPTER 1 =====================
  {
    chapterNumber: 1,
    moduleNumber: 1,
    title: 'Introduction to Data Mining',
    description: 'Fundamentals of the Knowledge Discovery in Databases (KDD) process, contrast with OLTP/OLAP, data types, and applications.',
    overview: 'Data mining is the computational process of discovering non-trivial, previously unknown, valid, and actionable patterns in vast datasets. Situated as the central phase of the Knowledge Discovery in Databases (KDD) pipeline, data mining merges techniques from database systems, machine learning, statistics, and high-performance computing to extract strategic business and scientific intelligence.',
    objectives: [
      'Define data mining and position it accurately within the broader Knowledge Discovery in Databases (KDD) framework.',
      'Differentiate between transactional processing (OLTP), analytical reporting (OLAP), and exploratory data mining.',
      'Identify the fundamental forms of data mined including relational, transactional, spatial, temporal, and multimedia data.',
      'Analyze the primary technical challenges in data mining: scalability, high dimensionality, noise handling, and ethical considerations.'
    ],
    content: `## 1. What is Data Mining?
Data mining, also referred to as **Knowledge Discovery in Databases (KDD)**, is the automated exploration and analysis of large quantities of data in order to discover meaningful patterns and rules. Rather than simply querying historical data for what happened, data mining seeks to uncover *why* things happened and *what is likely to happen next*.

### The KDD Process Pipeline
1. **Data Cleaning**: Removing noise and inconsistent data.
2. **Data Integration**: Combining multiple data sources.
3. **Data Selection**: Retrieving data relevant to the analysis task.
4. **Data Transformation**: Consolidating data into forms appropriate for mining (e.g., normalization, aggregation).
5. **Data Mining**: Applying intelligent algorithmic methods to extract data patterns.
6. **Pattern Evaluation**: Identifying truly interesting patterns representing knowledge based on interestingness measures.
7. **Knowledge Presentation**: Using visualization and representation techniques to convey mined knowledge to end-users.

## 2. Comparing OLTP, OLAP, and Data Mining
- **OLTP (Online Transaction Processing)**: Focuses on day-to-day transaction execution (e.g., banking transactions, retail checkouts). Characterized by high concurrency, normalized relational schemas, and fast ACID-compliant writes.
- **OLAP (Online Analytical Processing)**: Focuses on summarized historical reporting using multidimensional cubes (e.g., quarterly sales by region). Characterized by roll-up, drill-down, and slice-and-dice queries.
- **Data Mining**: Goes beyond predefined queries to find hidden correlations, predictive classifiers, and natural customer clusters without requiring a pre-formulated hypothesis.

## 3. Major Challenges in Data Mining
Mining real-world data involves overcoming massive scalability hurdles, handling high-dimensional feature spaces ("curse of dimensionality"), mitigating data drift over time, and ensuring ethical compliance regarding user privacy and algorithmic bias.`,
    keyConcepts: 'Knowledge Discovery in Databases (KDD), Pattern Interestingness, OLTP vs OLAP vs Data Mining, Curse of Dimensionality, Algorithmic Bias, Scalability.',
    slides: [
      { title: 'Introduction to Data Mining', subtitle: 'Chapter 1: Foundations', bullets: ['Extracting hidden, valid, and actionable patterns from big data', 'Convergence of statistics, machine learning, and database systems', 'From raw telemetry to strategic organizational wisdom'] },
      { title: 'The KDD Workflow', subtitle: 'Seven Steps from Data to Knowledge', bullets: ['Selection & Integration', 'Cleaning & Preprocessing', 'Transformation & Reduction', 'Data Mining Execution', 'Pattern Evaluation & Presentation'] },
      { title: 'Operational vs Analytical Paradigms', subtitle: 'OLTP, OLAP, and Data Mining', bullets: ['OLTP: High-speed transactional integrity', 'OLAP: Multi-dimensional cube aggregations', 'Data Mining: Automated predictive and exploratory discovery'] },
      { title: 'Core Challenges in Modern Mining', subtitle: 'Engineering Obstacles', bullets: ['High dimensionality and sparsity', 'Computational efficiency and real-time streaming', 'Data privacy, security, and ethical governance'] }
    ],
    questions: [
      {
        questionNumber: 1,
        questionText: 'Which step in the Knowledge Discovery in Databases (KDD) process is primarily responsible for removing erroneous, duplicate, and noisy records?',
        options: [
          { label: 'A', text: 'Data Selection', isCorrect: false },
          { label: 'B', text: 'Data Cleaning', isCorrect: true },
          { label: 'C', text: 'Data Transformation', isCorrect: false },
          { label: 'D', text: 'Pattern Evaluation', isCorrect: false }
        ]
      },
      {
        questionNumber: 2,
        questionText: 'How does Data Mining fundamentally differ from Online Transaction Processing (OLTP)?',
        options: [
          { label: 'A', text: 'OLTP discovers hidden predictive patterns, whereas data mining only records debit/credit transactions.', isCorrect: false },
          { label: 'B', text: 'OLTP focuses on day-to-day atomic transactional operations, while Data Mining performs inductive discovery on historical datasets.', isCorrect: true },
          { label: 'C', text: 'Data Mining exclusively utilizes 3NF relational schemas, while OLTP uses non-relational document trees.', isCorrect: false },
          { label: 'D', text: 'OLTP requires machine learning algorithms, whereas Data Mining only executes simple SQL select statements.', isCorrect: false }
        ]
      },
      {
        questionNumber: 3,
        questionText: 'What term describes a discovered pattern that is valid on new data with a high degree of certainty, novel, potentially useful, and easily understood by humans?',
        options: [
          { label: 'A', text: 'Overfitted model', isCorrect: false },
          { label: 'B', text: 'Interesting pattern / Knowledge', isCorrect: true },
          { label: 'C', text: 'Raw datum', isCorrect: false },
          { label: 'D', text: 'Synthetic artifact', isCorrect: false }
        ]
      },
      {
        questionNumber: 4,
        questionText: 'In the KDD pipeline, what is the specific role of "Data Transformation"?',
        options: [
          { label: 'A', text: 'Physically purchasing new server clusters', isCorrect: false },
          { label: 'B', text: 'Converting data into appropriate representations via scaling, aggregation, or normalization', isCorrect: true },
          { label: 'C', text: 'Deleting all tables containing null values', isCorrect: false },
          { label: 'D', text: 'Presenting bar charts to executive stakeholders', isCorrect: false }
        ]
      },
      {
        questionNumber: 5,
        questionText: 'Which characteristic best represents an Online Analytical Processing (OLAP) workload?',
        options: [
          { label: 'A', text: 'Frequent single-row inserts and millisecond ACID updates', isCorrect: false },
          { label: 'B', text: 'Multidimensional aggregate queries (such as sum, average) across historical business dimensions', isCorrect: true },
          { label: 'C', text: 'Continuous sensor telemetry capture without persistent storage', isCorrect: false },
          { label: 'D', text: 'Unsupervised clustering of unstructured audio waveforms', isCorrect: false }
        ]
      },
      {
        questionNumber: 6,
        questionText: 'What computational challenge arises when datasets feature hundreds or thousands of attributes, causing geometric distance measures to become uniform?',
        options: [
          { label: 'A', text: 'The curse of dimensionality', isCorrect: true },
          { label: 'B', text: 'The central limit theorem', isCorrect: false },
          { label: 'C', text: 'Simpson\'s Paradox', isCorrect: false },
          { label: 'D', text: 'Occam\'s Razor', isCorrect: false }
        ]
      },
      {
        questionNumber: 7,
        questionText: 'Which of the following is considered a primary descriptive (rather than predictive) data mining task?',
        options: [
          { label: 'A', text: 'Predicting credit default risk on new loan applicants', isCorrect: false },
          { label: 'B', text: 'Clustering customers into distinct market segments based on purchasing behavior', isCorrect: true },
          { label: 'C', text: 'Forecasting tomorrow\'s peak electrical load', isCorrect: false },
          { label: 'D', text: 'Estimating patient length of stay using regression', isCorrect: false }
        ]
      },
      {
        questionNumber: 8,
        questionText: 'In data mining terminology, what does "data redundancy" commonly lead to?',
        options: [
          { label: 'A', text: 'Faster algorithm execution and reduced disk usage', isCorrect: false },
          { label: 'B', text: 'Inconsistent data states and skewed frequency calculations during analysis', isCorrect: true },
          { label: 'C', text: 'Automatic resolution of missing values', isCorrect: false },
          { label: 'D', text: 'Guaranteed 100% classification precision', isCorrect: false }
        ]
      },
      {
        questionNumber: 9,
        questionText: 'Which ethical concern must data mining practitioners proactively address when constructing predictive profiling models?',
        options: [
          { label: 'A', text: 'Preventing algorithmic bias and preserving individual data privacy', isCorrect: true },
          { label: 'B', text: 'Ensuring code is written exclusively in assembly language', isCorrect: false },
          { label: 'C', text: 'Mandating that all databases utilize commercial licenses', isCorrect: false },
          { label: 'D', text: 'Disallowing the use of floating-point arithmetic', isCorrect: false }
        ]
      },
      {
        questionNumber: 10,
        questionText: 'What is the role of "Pattern Evaluation" in the KDD process?',
        options: [
          { label: 'A', text: 'Generating synthetic data attributes randomly', isCorrect: false },
          { label: 'B', text: 'Filtering out uninteresting patterns based on statistical novelty and domain utility measures', isCorrect: true },
          { label: 'C', text: 'Recompiling the database query optimizer', isCorrect: false },
          { label: 'D', text: 'Writing audit records to an operating system system log', isCorrect: false }
        ]
      },
      {
        questionNumber: 11,
        questionText: 'A retail chain discovers that customers purchasing infant diapers on Friday evenings frequently purchase craft beer. This discovery represents:',
        options: [
          { label: 'A', text: 'An outlier detection failure', isCorrect: false },
          { label: 'B', text: 'An association rule / affinity analysis pattern', isCorrect: true },
          { label: 'C', text: 'A deep reinforcement policy gradient', isCorrect: false },
          { label: 'D', text: 'A relational normalization constraint', isCorrect: false }
        ]
      },
      {
        questionNumber: 12,
        questionText: 'Which component is NOT typically part of an end-to-end data mining architecture?',
        options: [
          { label: 'A', text: 'Database or Data Warehouse server', isCorrect: false },
          { label: 'B', text: 'Data Mining Engine', isCorrect: false },
          { label: 'C', text: 'Pattern Evaluation Module', isCorrect: false },
          { label: 'D', text: 'Analog signal modulator', isCorrect: true }
        ]
      },
      {
        questionNumber: 13,
        questionText: 'What distinguishes structured data from unstructured data in modern mining environments?',
        options: [
          { label: 'A', text: 'Structured data conforms to a predefined schema (e.g., relational tables), whereas unstructured lacks formal tabular schemas (e.g., video, text).', isCorrect: true },
          { label: 'B', text: 'Structured data cannot be analyzed with computers.', isCorrect: false },
          { label: 'C', text: 'Unstructured data contains no information.', isCorrect: false },
          { label: 'D', text: 'Structured data is exclusively text files, while unstructured is numbers.', isCorrect: false }
        ]
      },
      {
        questionNumber: 14,
        questionText: 'Why is automated hypothesis generation in data mining termed "inductive learning"?',
        options: [
          { label: 'A', text: 'It reasons from specific observations to general pattern formulations.', isCorrect: true },
          { label: 'B', text: 'It strictly deduces conclusions from fixed mathematical axioms without empirical data.', isCorrect: false },
          { label: 'C', text: 'It requires electrical induction to activate storage media.', isCorrect: false },
          { label: 'D', text: 'It guarantees that no training errors can exist.', isCorrect: false }
        ]
      },
      {
        questionNumber: 15,
        questionText: 'In data mining, what is a "concept hierarchy"?',
        options: [
          { label: 'A', text: 'A sequence of mappings from low-level concepts to higher-level, more general concepts', isCorrect: true },
          { label: 'B', text: 'A list of software developer organizational roles', isCorrect: false },
          { label: 'C', text: 'A hardware diagram illustrating CPU cache levels', isCorrect: false },
          { label: 'D', text: 'The file path on a Linux file system', isCorrect: false }
        ]
      },
      {
        questionNumber: 16,
        questionText: 'Which statement accurately describes the trade-off between model accuracy and model interpretability?',
        options: [
          { label: 'A', text: 'Complex non-linear models (e.g., deep neural networks) frequently achieve high predictive accuracy but lower human interpretability compared to simple decision trees.', isCorrect: true },
          { label: 'B', text: 'Linear regression is completely uninterpretable by humans.', isCorrect: false },
          { label: 'C', text: 'Model complexity has zero impact on interpretability.', isCorrect: false },
          { label: 'D', text: 'Rule-based models are always the least interpretable models in existence.', isCorrect: false }
        ]
      },
      {
        questionNumber: 17,
        questionText: 'Which data mining function aims to identify anomalous data objects that do not comply with general data distributions?',
        options: [
          { label: 'A', text: 'Outlier / Anomaly detection', isCorrect: true },
          { label: 'B', text: 'Frequent sequence mining', isCorrect: false },
          { label: 'C', text: 'Data discretization', isCorrect: false },
          { label: 'D', text: 'Entity-relationship modeling', isCorrect: false }
        ]
      },
      {
        questionNumber: 18,
        questionText: 'What is "Data Drift" in production data mining applications?',
        options: [
          { label: 'A', text: 'The physical migration of hard drives across server racks', isCorrect: false },
          { label: 'B', text: 'The degradation of model performance over time caused by changes in the statistical properties of input data', isCorrect: true },
          { label: 'C', text: 'A deliberate feature selection technique', isCorrect: false },
          { label: 'D', text: 'The loss of network packets during database replication', isCorrect: false }
        ]
      },
      {
        questionNumber: 19,
        questionText: 'What is the primary objective of "Data Integration" in data warehousing and mining?',
        options: [
          { label: 'A', text: 'Combining heterogenous data from multiple repositories into a unified, coherent data store', isCorrect: true },
          { label: 'B', text: 'Encrypting data so it can never be decrypted', isCorrect: false },
          { label: 'C', text: 'Converting numerical values into unreadable binary hashes', isCorrect: false },
          { label: 'D', text: 'Restricting database queries to single-table joins only', isCorrect: false }
        ]
      },
      {
        questionNumber: 20,
        questionText: 'Which regulatory standard emphasizes "the right to an explanation" regarding automated algorithmic decisions impacting individuals?',
        options: [
          { label: 'A', text: 'General Data Protection Regulation (GDPR)', isCorrect: true },
          { label: 'B', text: 'IEEE 802.11ac', isCorrect: false },
          { label: 'C', text: 'POSIX 1003.1', isCorrect: false },
          { label: 'D', text: 'SQL-92 Specification', isCorrect: false }
        ]
      }
    ]
  },

  // ===================== CHAPTER 2 =====================
  {
    chapterNumber: 2,
    moduleNumber: 1,
    title: 'Data, Measurements, and Data Preprocessing',
    description: 'Attribute types, statistical descriptions, data cleaning, integration, transformation, normalization, and reduction.',
    overview: 'Real-world data is predominantly dirty: incomplete, noisy, inconsistent, and high-dimensional. Data preprocessing constitutes up to 80% of the overall effort in practical data mining projects. This chapter examines attribute measurement scales, summary statistics, missing data imputation, outlier smoothing, min-max and z-score normalization, and principal component analysis.',
    objectives: [
      'Classify attributes into nominal, binary, ordinal, interval, and ratio measurement scales.',
      'Compute and interpret measures of central tendency (mean, median, mode) and dispersion (variance, interquartile range).',
      'Implement data cleaning strategies for handling missing values and noisy records.',
      'Apply normalization techniques (min-max, z-score, decimal scaling) and dimensionality reduction methods (PCA).'
    ],
    content: `## 1. Types of Attributes
Data sets are made up of data objects representing entities. Attributes (features, variables) describe data objects:
- **Nominal**: Categorical values with no inherent ordering (e.g., hair color: black, blond, brown).
- **Binary**: Nominal attribute with only two states (0 and 1, symmetric or asymmetric).
- **Ordinal**: Values have a meaningful sequence or ranking, but magnitude difference cannot be measured (e.g., customer satisfaction: low, medium, high).
- **Numeric (Interval-Scaled)**: Measured on a scale of equal-sized units, with no true absolute zero point (e.g., temperature in Celsius, calendar dates).
- **Numeric (Ratio-Scaled)**: Numeric attribute with an inherent absolute zero point (e.g., salary, weight, age).

## 2. Measuring Central Tendency and Dispersion
- **Mean**: Arithmetic average sensitive to extreme outliers.
- **Median**: Middle value of sorted data; robust against skewness and outliers.
- **Mode**: Most frequently occurring value; applicable to nominal data.
- **Five-Number Summary**: Minimum, First Quartile (Q1), Median (Q2), Third Quartile (Q3), Maximum.
- **Interquartile Range (IQR)**: $\\text{IQR} = Q3 - Q1$. Outliers are values outside $[Q1 - 1.5 \\times \\text{IQR}, Q3 + 1.5 \\times \\text{IQR}]$.

## 3. Data Cleaning and Imputation
- **Missing Data Strategies**: Ignore tuple, manual fill, global constant, attribute mean/median, or predictive model estimation (e.g., k-NN imputation).
- **Noise Smoothing**: Binning (smooth by bin means, medians, or boundaries), regression fitting, and clustering.

## 4. Normalization Techniques
- **Min-Max Normalization**: Maps value $v$ to $[\\text{new\\_min}, \\text{new\\_max}]$:
$$v' = \\frac{v - \\min_A}{\\max_A - \\min_A} (\\text{new\\_max} - \\text{new\\_min}) + \\text{new\\_min}$$
- **Z-Score Normalization (Standardization)**: Useful when actual minimum and maximum are unknown or outliers dominate:
$$v' = \\frac{v - \\mu_A}{\\sigma_A}$$`,
    keyConcepts: 'Attribute Scales, Five-Number Summary, Boxplots, Binning, Min-Max Normalization, Z-Score Standardization, Principal Component Analysis (PCA).',
    slides: [
      { title: 'Attribute Measurement Scales', subtitle: 'Chapter 2: Data Preprocessing', bullets: ['Nominal & Ordinal: Qualitative categorical features', 'Interval & Ratio: Quantitative numeric measurements', 'Why feature scale dictates valid mathematical operators'] },
      { title: 'Summary Statistics & Outlier Bounds', subtitle: 'Understanding Distributions', bullets: ['Mean vs Median: Robustness against skewness', 'Five-Number Summary: Min, Q1, Median, Q3, Max', 'Boxplot 1.5 x IQR outlier detection rule'] },
      { title: 'Data Cleaning Strategies', subtitle: 'Handling Real-World Dirtiness', bullets: ['Imputation: Mean, median, mode, or k-NN regression', 'Noise smoothing: Equal-width vs equal-frequency binning', 'Deduplication and integrity constraint validation'] },
      { title: 'Data Transformation & Normalization', subtitle: 'Preparing Vectors for ML', bullets: ['Min-Max Scaling: Rescaling to fixed range [0, 1]', 'Z-Score Standardization: Zero mean, unit variance', 'PCA: Orthogonal projection to lower-dimensional space'] }
    ],
    questions: [
      {
        questionNumber: 1,
        questionText: 'Which measurement scale possesses a true absolute zero point where 0 indicates the total absence of the measured property?',
        options: [
          { label: 'A', text: 'Nominal scale', isCorrect: false },
          { label: 'B', text: 'Ordinal scale', isCorrect: false },
          { label: 'C', text: 'Interval scale', isCorrect: false },
          { label: 'D', text: 'Ratio scale', isCorrect: true }
        ]
      },
      {
        questionNumber: 2,
        questionText: 'Why is the median generally preferred over the sample mean when analyzing income distributions?',
        options: [
          { label: 'A', text: 'The median is computationally impossible to calculate.', isCorrect: false },
          { label: 'B', text: 'The median is robust and insensitive to extreme outlier values.', isCorrect: true },
          { label: 'C', text: 'The mean can only be computed on categorical data.', isCorrect: false },
          { label: 'D', text: 'Income data contains no numeric values.', isCorrect: false }
        ]
      },
      {
        questionNumber: 3,
        questionText: 'Under the standard boxplot rule, a data value is designated an outlier if it falls below:',
        options: [
          { label: 'A', text: 'Q1 - 1.5 * IQR', isCorrect: true },
          { label: 'B', text: 'Median - 3.0 * IQR', isCorrect: false },
          { label: 'C', text: 'Q3 + 1.5 * IQR', isCorrect: false },
          { label: 'D', text: 'Mean - 2.0 * Standard Deviation', isCorrect: false }
        ]
      },
      {
        questionNumber: 4,
        questionText: 'Given an attribute with minimum value 200 and maximum 1000, what is the Min-Max normalized value of 600 onto the range [0, 1]?',
        options: [
          { label: 'A', text: '0.25', isCorrect: false },
          { label: 'B', text: '0.50', isCorrect: true },
          { label: 'C', text: '0.60', isCorrect: false },
          { label: 'D', text: '0.75', isCorrect: false }
        ]
      },
      {
        questionNumber: 5,
        questionText: 'If an attribute has a mean of 50 and a standard deviation of 10, what is the Z-score normalized value for 75?',
        options: [
          { label: 'A', text: '+2.5', isCorrect: true },
          { label: 'B', text: '-2.5', isCorrect: false },
          { label: 'C', text: '+1.5', isCorrect: false },
          { label: 'D', text: '+0.75', isCorrect: false }
        ]
      },
      {
        questionNumber: 6,
        questionText: 'Which binning method partitions data into intervals such that each bin contains approximately the same number of samples?',
        options: [
          { label: 'A', text: 'Equal-width binning', isCorrect: false },
          { label: 'B', text: 'Equal-frequency (equal-depth) binning', isCorrect: true },
          { label: 'C', text: 'Random partition binning', isCorrect: false },
          { label: 'D', text: 'Lexicographical binning', isCorrect: false }
        ]
      },
      {
        questionNumber: 7,
        questionText: 'What is the primary objective of Principal Component Analysis (PCA)?',
        options: [
          { label: 'A', text: 'To add random noise to prevent reverse-engineering', isCorrect: false },
          { label: 'B', text: 'To reduce dimensionality by projecting data onto orthogonal axes that maximize variance', isCorrect: true },
          { label: 'C', text: 'To convert all continuous variables into nominal strings', isCorrect: false },
          { label: 'D', text: 'To increase the number of correlated columns', isCorrect: false }
        ]
      },
      {
        questionNumber: 8,
        questionText: 'What type of attribute is represented by customer ratings: "Poor", "Fair", "Good", "Excellent"?',
        options: [
          { label: 'A', text: 'Continuous ratio', isCorrect: false },
          { label: 'B', text: 'Ordinal attribute', isCorrect: true },
          { label: 'C', text: 'Symmetric binary', isCorrect: false },
          { label: 'D', text: 'Interval-scaled metric', isCorrect: false }
        ]
      },
      {
        questionNumber: 9,
        questionText: 'In data integration, what problem arises when the same real-world entity is stored under different attribute names across databases (e.g., cust_id vs client_number)?',
        options: [
          { label: 'A', text: 'Entity identification problem', isCorrect: true },
          { label: 'B', text: 'Memory fragmentation', isCorrect: false },
          { label: 'C', text: 'Thread deadlock', isCorrect: false },
          { label: 'D', text: 'Cache eviction', isCorrect: false }
        ]
      },
      {
        questionNumber: 10,
        questionText: 'Which correlation test is mathematically appropriate for assessing correlation between two categorical (nominal) attributes?',
        options: [
          { label: 'A', text: 'Pearson correlation coefficient', isCorrect: false },
          { label: 'B', text: 'Chi-Square (χ²) test of independence', isCorrect: true },
          { label: 'C', text: 'Euclidean norm', isCorrect: false },
          { label: 'D', text: 'Cosine vector product', isCorrect: false }
        ]
      },
      {
        questionNumber: 11,
        questionText: 'Which missing-value treatment preserves the variance of the attribute best when compared to unconditional mean substitution?',
        options: [
          { label: 'A', text: 'Predictive regression or k-nearest neighbor imputation', isCorrect: true },
          { label: 'B', text: 'Filling all empty values with zeros', isCorrect: false },
          { label: 'C', text: 'Filling with the maximum observed value', isCorrect: false },
          { label: 'D', text: 'Filling with empty text strings', isCorrect: false }
        ]
      },
      {
        questionNumber: 12,
        questionText: 'What is the Interquartile Range (IQR) for a dataset with Q1 = 24 and Q3 = 78?',
        options: [
          { label: 'A', text: '102', isCorrect: false },
          { label: 'B', text: '54', isCorrect: true },
          { label: 'C', text: '51', isCorrect: false },
          { label: 'D', text: '27', isCorrect: false }
        ]
      },
      {
        questionNumber: 13,
        questionText: 'Which normalization method transforms values by moving the decimal point based on the maximum absolute value of attribute A?',
        options: [
          { label: 'A', text: 'Decimal scaling', isCorrect: true },
          { label: 'B', text: 'Quantile normalization', isCorrect: false },
          { label: 'C', text: 'Z-score standardization', isCorrect: false },
          { label: 'D', text: 'Min-max compression', isCorrect: false }
        ]
      },
      {
        questionNumber: 14,
        questionText: 'Temperature measured in degrees Fahrenheit is categorized under which measurement scale?',
        options: [
          { label: 'A', text: 'Interval scale (since 0°F is not an absolute absence of heat)', isCorrect: true },
          { label: 'B', text: 'Ratio scale', isCorrect: false },
          { label: 'C', text: 'Nominal scale', isCorrect: false },
          { label: 'D', text: 'Binary scale', isCorrect: false }
        ]
      },
      {
        questionNumber: 15,
        questionText: 'What is "Data Discretization"?',
        options: [
          { label: 'A', text: 'Deleting all confidential employee records', isCorrect: false },
          { label: 'B', text: 'Transforming continuous numeric attributes into categorical or nominal intervals', isCorrect: true },
          { label: 'C', text: 'Splitting databases across physical server disks', isCorrect: false },
          { label: 'D', text: 'Compressing images using lossy JPEG encoding', isCorrect: false }
        ]
      },
      {
        questionNumber: 16,
        questionText: 'In smoothing by bin boundaries, how is each value in a bin replaced?',
        options: [
          { label: 'A', text: 'By the closest bin boundary value (min or max of the bin)', isCorrect: true },
          { label: 'B', text: 'By zero always', isCorrect: false },
          { label: 'C', text: 'By the arithmetic mean of all bins', isCorrect: false },
          { label: 'D', text: 'By a random integer', isCorrect: false }
        ]
      },
      {
        questionNumber: 17,
        questionText: 'If two continuous attributes have a Pearson correlation coefficient of r = -0.92, what does this indicate?',
        options: [
          { label: 'A', text: 'No linear relationship exists between them.', isCorrect: false },
          { label: 'B', text: 'A strong negative linear correlation exists (as one increases, the other decreases).', isCorrect: true },
          { label: 'C', text: 'A strong positive relationship where both increase together.', isCorrect: false },
          { label: 'D', text: 'The calculation produced an error since r must be positive.', isCorrect: false }
        ]
      },
      {
        questionNumber: 18,
        questionText: 'What is the "Five-Number Summary" used to construct?',
        options: [
          { label: 'A', text: 'Boxplot', isCorrect: true },
          { label: 'B', text: 'Scatter plot matrix', isCorrect: false },
          { label: 'C', text: 'Histogram with 5 bars', isCorrect: false },
          { label: 'D', text: 'Voronoi diagram', isCorrect: false }
        ]
      },
      {
        questionNumber: 19,
        questionText: 'Sampling without replacement means that:',
        options: [
          { label: 'A', text: 'Each item chosen from the population is not returned and cannot be selected again.', isCorrect: true },
          { label: 'B', text: 'The same item can be picked an infinite number of times.', isCorrect: false },
          { label: 'C', text: 'Only noisy records are selected.', isCorrect: false },
          { label: 'D', text: 'The sample size is always larger than the population size.', isCorrect: false }
        ]
      },
      {
        questionNumber: 20,
        questionText: 'Why is data preprocessing crucial prior to applying distance-based machine learning algorithms (like k-Means or k-NN)?',
        options: [
          { label: 'A', text: 'Because distance metrics are dominated by features with arbitrarily large numerical scales unless normalized.', isCorrect: true },
          { label: 'B', text: 'Because distance metrics only work on textual strings.', isCorrect: false },
          { label: 'C', text: 'Because k-Means crashes if data values are between 0 and 1.', isCorrect: false },
          { label: 'D', text: 'Because raw unscaled data automatically causes division by zero.', isCorrect: false }
        ]
      }
    ]
  },

  // ===================== CHAPTER 3 =====================
  {
    chapterNumber: 3,
    moduleNumber: 1,
    title: 'Data Warehousing and Online Analytical Processing (OLAP)',
    description: 'Data warehouse architecture, star/snowflake/fact constellation schemas, multidimensional cubes, and OLAP operations.',
    overview: 'A Data Warehouse is a subject-oriented, integrated, time-variant, and non-volatile collection of data organized in support of management decision-making. This chapter explores multidimensional data modeling, the distinctions between star and snowflake schemas, fact tables versus dimension tables, and OLAP cube manipulation operations including drill-down, roll-up, slice, dice, and pivot.',
    objectives: [
      'Characterize the four core pillars of data warehouses: subject-oriented, integrated, time-variant, and non-volatile.',
      'Compare multidimensional schema designs: Star Schema, Snowflake Schema, and Fact Constellation.',
      'Differentiate between Multidimensional OLAP (MOLAP), Relational OLAP (ROLAP), and Hybrid OLAP (HOLAP).',
      'Execute and explain analytical cube operations: roll-up, drill-down, slice, dice, and pivot.'
    ],
    content: `## 1. Defining the Data Warehouse
W.H. Inmon defined a data warehouse through four essential properties:
1. **Subject-Oriented**: Data is categorized around major business subjects (e.g., customers, products, sales), rather than application processes.
2. **Integrated**: Constructed by consolidating heterogeneous data sources into uniform naming conventions, encoding structures, and physical units.
3. **Time-Variant**: Historical data spans extended periods (5-10 years) with time explicitly included as an analytical key dimension.
4. **Non-Volatile**: Data is physically loaded and queried; operational updates and deletes do not occur in place.

## 2. Multidimensional Data Models
- **Fact Table**: Contains numeric measurements (measures, e.g., dollars sold, units shipped) and foreign keys referencing dimension tables.
- **Dimension Table**: Contains contextual descriptive attributes (e.g., time, store location, customer demographics).

### Schema Configurations
- **Star Schema**: Central fact table connected directly to non-normalized radial dimension tables. High query performance due to simple joins.
- **Snowflake Schema**: Normalized dimension tables creating sub-dimensions. Saves storage and avoids redundancy at the cost of additional table joins.
- **Fact Constellation (Galaxy Schema)**: Multiple fact tables sharing common dimension tables.

## 3. OLAP Operations
- **Roll-Up (Drill-Up)**: Aggregates data by climbing up a concept hierarchy or reducing dimensions (e.g., from day to month to year).
- **Drill-Down**: Navigates from less detailed data to more granular data (e.g., from country to state to city).
- **Slice**: Performs a selection on one dimension of the cube, resulting in a sub-cube.
- **Dice**: Defines a sub-cube by selecting on two or more dimensions.
- **Pivot (Rotate)**: Visual rotation of the data axes to view data from different perspectives.`,
    keyConcepts: 'Subject-Oriented, Non-Volatile, Fact Table, Dimension Table, Star Schema, Snowflake Schema, Drill-Down, Roll-Up, Slice, Dice, MOLAP vs ROLAP.',
    slides: [
      { title: 'The Modern Data Warehouse', subtitle: 'Chapter 3: Architecture & OLAP', bullets: ['Subject-oriented, integrated, time-variant, non-volatile', 'Separating operational OLTP from analytical decision support', 'ETL: Extract, Transform, and Load lifecycle'] },
      { title: 'Multidimensional Schema Architectures', subtitle: 'Facts & Dimensions', bullets: ['Star Schema: Denormalized dimensions, blazing join speed', 'Snowflake Schema: Normalized dimensions, reduced redundancy', 'Fact Constellation: Shared dimensions across multiple fact tables'] },
      { title: 'OLAP Cube Mechanics', subtitle: 'Analytical Interactivity', bullets: ['Roll-Up: Aggregating upwards to higher abstraction', 'Drill-Down: Descending into finer granularity', 'Slice & Dice: Filtering along one or multiple coordinates', 'Pivot: Dynamic rotational perspective'] },
      { title: 'Server Implementation Engines', subtitle: 'ROLAP, MOLAP & HOLAP', bullets: ['ROLAP: Relational tables with star-join query engines', 'MOLAP: Array-based multi-dimensional physical storage', 'HOLAP: Hybrid storage combining speed and relational scale'] }
    ],
    questions: [
      {
        questionNumber: 1,
        questionText: 'According to Bill Inmon\'s classic definition, which four properties characterize a data warehouse?',
        options: [
          { label: 'A', text: 'Subject-oriented, Integrated, Time-variant, Non-volatile', isCorrect: true },
          { label: 'B', text: 'Distributed, Encrypted, Volatile, Synchronous', isCorrect: false },
          { label: 'C', text: 'Normalized, Object-oriented, Real-time, Ephemeral', isCorrect: false },
          { label: 'D', text: 'Relational, Unstructured, Volatile, Single-tenant', isCorrect: false }
        ]
      },
      {
        questionNumber: 2,
        questionText: 'What primary elements are contained within a centralized Fact Table?',
        options: [
          { label: 'A', text: 'Only user login credentials and session tokens', isCorrect: false },
          { label: 'B', text: 'Numerical measures (metrics) and foreign keys referencing dimension tables', isCorrect: true },
          { label: 'C', text: 'Raw unparsed server error logs', isCorrect: false },
          { label: 'D', text: 'Source code repositories and script files', isCorrect: false }
        ]
      },
      {
        questionNumber: 3,
        questionText: 'How does a Snowflake Schema differ architecturally from a Star Schema?',
        options: [
          { label: 'A', text: 'The Snowflake schema normalizes dimension tables into hierarchies, whereas the Star schema leaves them denormalized.', isCorrect: true },
          { label: 'B', text: 'The Snowflake schema contains no fact tables.', isCorrect: false },
          { label: 'C', text: 'The Star schema only works on NoSQL databases.', isCorrect: false },
          { label: 'D', text: 'The Snowflake schema requires all values to be stored in memory.', isCorrect: false }
        ]
      },
      {
        questionNumber: 4,
        questionText: 'Which OLAP operation navigates from summarized higher-level data to more granular, detailed data (e.g., from quarterly sales to daily sales)?',
        options: [
          { label: 'A', text: 'Roll-up', isCorrect: false },
          { label: 'B', text: 'Drill-down', isCorrect: true },
          { label: 'C', text: 'Slice', isCorrect: false },
          { label: 'D', text: 'Pivot', isCorrect: false }
        ]
      },
      {
        questionNumber: 5,
        questionText: 'What OLAP operation performs a selection on ONE specific dimension to produce a two-dimensional sub-cube?',
        options: [
          { label: 'A', text: 'Slice', isCorrect: true },
          { label: 'B', text: 'Dice', isCorrect: false },
          { label: 'C', text: 'Drill-across', isCorrect: false },
          { label: 'D', text: 'Aggregation', isCorrect: false }
        ]
      },
      {
        questionNumber: 6,
        questionText: 'The OLAP operation that selects a sub-cube by filtering across TWO or more dimensions simultaneously is known as:',
        options: [
          { label: 'A', text: 'Roll-up', isCorrect: false },
          { label: 'B', text: 'Dice', isCorrect: true },
          { label: 'C', text: 'Drill-through', isCorrect: false },
          { label: 'D', text: 'Pivot', isCorrect: false }
        ]
      },
      {
        questionNumber: 7,
        questionText: 'Rotating the 2D visualization axes of an OLAP cube to view data from alternative perspectives is called:',
        options: [
          { label: 'A', text: 'Pivot (Rotate)', isCorrect: true },
          { label: 'B', text: 'Projection', isCorrect: false },
          { label: 'C', text: 'Cartesian product', isCorrect: false },
          { label: 'D', text: 'Snowflaking', isCorrect: false }
        ]
      },
      {
        questionNumber: 8,
        questionText: 'What is a "Fact Constellation" (or Galaxy Schema)?',
        options: [
          { label: 'A', text: 'A schema containing multiple fact tables sharing common dimension tables', isCorrect: true },
          { label: 'B', text: 'A database that only stores astronomical data', isCorrect: false },
          { label: 'C', text: 'A flat file without keys or relations', isCorrect: false },
          { label: 'D', text: 'A single table in Third Normal Form (3NF)', isCorrect: false }
        ]
      },
      {
        questionNumber: 9,
        questionText: 'Which OLAP server architecture physically stores data in specialized multidimensional array structures rather than relational tables?',
        options: [
          { label: 'A', text: 'ROLAP (Relational OLAP)', isCorrect: false },
          { label: 'B', text: 'MOLAP (Multidimensional OLAP)', isCorrect: true },
          { label: 'C', text: 'SQL-OLAP', isCorrect: false },
          { label: 'D', text: 'CSV-OLAP', isCorrect: false }
        ]
      },
      {
        questionNumber: 10,
        questionText: 'What does "Non-Volatile" mean in the context of data warehouses?',
        options: [
          { label: 'A', text: 'Data disappears whenever power is interrupted.', isCorrect: false },
          { label: 'B', text: 'Data is loaded and accessed, but operational updates and deletes do not overwrite historical records.', isCorrect: true },
          { label: 'C', text: 'Data can only be written once and never read.', isCorrect: false },
          { label: 'D', text: 'The warehouse cannot store numerical values.', isCorrect: false }
        ]
      },
      {
        questionNumber: 11,
        questionText: 'In a data warehouse dimensional model, surrogate keys are used instead of natural business keys primarily to:',
        options: [
          { label: 'A', text: 'Insulate the warehouse from source system key changes and manage slowly changing dimensions (SCD)', isCorrect: true },
          { label: 'B', text: 'Make queries intentionally slower for testing', isCorrect: false },
          { label: 'C', text: 'Reduce data compression efficiency', isCorrect: false },
          { label: 'D', text: 'Prevent foreign key constraints from functioning', isCorrect: false }
        ]
      },
      {
        questionNumber: 12,
        questionText: 'Which measure type can be computed by applying an aggregate function to values from subsets of the data (e.g., SUM, COUNT, MIN, MAX)?',
        options: [
          { label: 'A', text: 'Distributive measure', isCorrect: true },
          { label: 'B', text: 'Non-algebraic measure', isCorrect: false },
          { label: 'C', text: 'Holistic measure (e.g., Median)', isCorrect: false },
          { label: 'D', text: 'Nominal scale measure', isCorrect: false }
        ]
      },
      {
        questionNumber: 13,
        questionText: 'Why is the median classified as a "holistic" measure rather than an algebraic or distributive measure?',
        options: [
          { label: 'A', text: 'There is no constant-bound algebraic formula to compute the median of a whole set from sub-aggregate values.', isCorrect: true },
          { label: 'B', text: 'The median can only be calculated on text.', isCorrect: false },
          { label: 'C', text: 'The median is always equal to the mean.', isCorrect: false },
          { label: 'D', text: 'It requires zero disk storage.', isCorrect: false }
        ]
      },
      {
        questionNumber: 14,
        questionText: 'What is a "Data Mart"?',
        options: [
          { label: 'A', text: 'A departmental subset of an enterprise data warehouse focused on a specific business unit or domain', isCorrect: true },
          { label: 'B', text: 'An e-commerce website for purchasing hardware', isCorrect: false },
          { label: 'C', text: 'A corrupted database file', isCorrect: false },
          { label: 'D', text: 'A database that stores only discarded data', isCorrect: false }
        ]
      },
      {
        questionNumber: 15,
        questionText: 'What is the function of the "Staging Area" in an ETL (Extract, Transform, Load) pipeline?',
        options: [
          { label: 'A', text: 'A transient storage zone where extracted data is cleaned, validated, and transformed prior to warehouse ingestion', isCorrect: true },
          { label: 'B', text: 'The final table displayed to end-users', isCorrect: false },
          { label: 'C', text: 'A backup tape storage facility', isCorrect: false },
          { label: 'D', text: 'The web browser frontend cache', isCorrect: false }
        ]
      },
      {
        questionNumber: 16,
        questionText: 'In a Star Schema, why are dimension tables deliberately left denormalized?',
        options: [
          { label: 'A', text: 'To avoid complex multi-table joins and optimize OLAP read performance', isCorrect: true },
          { label: 'B', text: 'Because database engines forbid foreign keys', isCorrect: false },
          { label: 'C', text: 'To maximize physical storage consumption', isCorrect: false },
          { label: 'D', text: 'Because normalization has no benefits in software engineering', isCorrect: false }
        ]
      },
      {
        questionNumber: 17,
        questionText: 'Which slowly changing dimension (SCD) strategy overwrites the existing record with the new value, retaining no historical trail?',
        options: [
          { label: 'A', text: 'SCD Type 1', isCorrect: true },
          { label: 'B', text: 'SCD Type 2 (adds a new version row with effective dates)', isCorrect: false },
          { label: 'C', text: 'SCD Type 3 (adds a prior value column)', isCorrect: false },
          { label: 'D', text: 'SCD Type 6', isCorrect: false }
        ]
      },
      {
        questionNumber: 18,
        questionText: 'What is the base cuboid in an n-dimensional data cube lattice?',
        options: [
          { label: 'A', text: 'The lowest-level cuboid containing the most detailed, un-summarized data (all n dimensions)', isCorrect: true },
          { label: 'B', text: 'The 0-D apex cuboid holding the total grand aggregate', isCorrect: false },
          { label: 'C', text: 'An empty relational table', isCorrect: false },
          { label: 'D', text: 'The database system catalog', isCorrect: false }
        ]
      },
      {
        questionNumber: 19,
        questionText: 'For a data cube constructed across 5 independent dimensions, how many total cuboids exist in its complete cube lattice?',
        options: [
          { label: 'A', text: '2^5 = 32 cuboids', isCorrect: true },
          { label: 'B', text: '5 * 2 = 10 cuboids', isCorrect: false },
          { label: 'C', text: '5^2 = 25 cuboids', isCorrect: false },
          { label: 'D', text: '5! = 120 cuboids', isCorrect: false }
        ]
      },
      {
        questionNumber: 20,
        questionText: 'How does Hybrid OLAP (HOLAP) balance storage and query responsiveness?',
        options: [
          { label: 'A', text: 'It stores pre-aggregated summary cubes in array-based MOLAP structures while keeping raw detailed records in ROLAP relational tables.', isCorrect: true },
          { label: 'B', text: 'It deletes detailed records as soon as aggregates are computed.', isCorrect: false },
          { label: 'C', text: 'It runs queries only during nighttime maintenance windows.', isCorrect: false },
          { label: 'D', text: 'It completely eliminates the need for database indexing.', isCorrect: false }
        ]
      }
    ]
  },

  // ===================== CHAPTER 4 =====================
  {
    chapterNumber: 4,
    moduleNumber: 2,
    title: 'Pattern Mining: Basic Concepts and Methods',
    description: 'Market basket analysis, support and confidence, the Apriori property, join and prune steps, and candidate generation.',
    overview: 'Pattern mining uncovers recurring relationships, associations, and correlations among items in transactional databases. Introduced in the context of market basket analysis, association rule discovery seeks rules of the form $X \\implies Y$. This chapter covers the foundational metrics of support and confidence, the downward-closure Apriori property, and candidate generation algorithms.',
    objectives: [
      'Formulate association rules and compute their Support and Confidence metrics.',
      'Explain and leverage the Apriori Property (downward closure of support) for search space pruning.',
      'Trace candidate generation and pruning steps in the level-wise Apriori algorithm.',
      'Evaluate rule interestingness and distinguish actionable associations from coincidental co-occurrences.'
    ],
    content: `## 1. Association Rule Mining Basics
Given a set of transactions $D$, an association rule has the form:
$$X \\implies Y \\quad (\\text{where } X, Y \\subset I \\text{ and } X \\cap Y = \\emptyset)$$
- **Support**: Probability that a transaction contains both $X$ and $Y$:
$$\\text{Support}(X \\implies Y) = P(X \\cup Y) = \\frac{\\sigma(X \\cup Y)}{|D|}$$
- **Confidence**: Conditional probability that a transaction contains $Y$ given that it contains $X$:
$$\\text{Confidence}(X \\implies Y) = P(Y \\mid X) = \\frac{\\sigma(X \\cup Y)}{\\sigma(X)} = \\frac{\\text{Support}(X \\cup Y)}{\\text{Support}(X)}$$
A rule is **frequent** if its support exceeds $\\text{min\\_sup}$ and **strong** if its confidence exceeds $\\text{min\\_conf}$.

## 2. The Apriori Property
> **Apriori Property (Downward Closure)**: All nonempty subsets of a frequent itemset must also be frequent.
Conversely, if an itemset is infrequent, all of its supersets are inherently infrequent and can be immediately pruned without scanning the database.

## 3. The Apriori Algorithm Workflow
Iterative level-wise approach:
1. Scan database to find frequent 1-itemsets ($L_1$).
2. Generate candidate $k$-itemsets ($C_k$) by joining $L_{k-1}$ with itself ($L_{k-1} \\bowtie L_{k-1}$).
3. **Prune**: Remove candidate itemsets in $C_k$ if any of their $(k-1)$-subsets are not in $L_{k-1}$.
4. Scan database to count support of candidates in $C_k$ and form $L_k$.
5. Terminate when no frequent itemsets can be generated.`,
    keyConcepts: 'Itemset, Support, Confidence, Strong Association Rule, Apriori Property, Downward Closure, Join Step, Prune Step.',
    slides: [
      { title: 'Market Basket Analysis', subtitle: 'Chapter 4: Basic Pattern Mining', bullets: ['Discovering purchasing affinities: Itemset X implies Itemset Y', 'Support: Frequency of joint co-occurrence', 'Confidence: Conditional certainty of the rule'] },
      { title: 'The Apriori Principle', subtitle: 'Downward Closure Property', bullets: ['If an itemset is frequent, all its subsets must be frequent', 'If an itemset is infrequent, all supersets are pruned', 'Exponentially shrinks the combinatorial search space'] },
      { title: 'Apriori Level-Wise Step Execution', subtitle: 'Join and Prune Lifecycle', bullets: ['Join step: L_{k-1} self-join to form candidate C_k', 'Prune step: Discard candidates with infrequent subsets', 'Support verification against transactional logs'] },
      { title: 'Rule Generation from Frequent Sets', subtitle: 'Strong Association Rules', bullets: ['Partitioning frequent itemset L into antecedent X and consequent Y', 'Confidence thresholding: Conf(X -> Y) >= min_conf', 'Avoiding weak rules with high baseline support'] }
    ],
    questions: [
      {
        questionNumber: 1,
        questionText: 'In a transactional dataset of 1,000 transactions, 200 transactions contain item A, 150 contain item B, and 100 contain both A and B. What is the support of the rule A => B?',
        options: [
          { label: 'A', text: '10%', isCorrect: true },
          { label: 'B', text: '20%', isCorrect: false },
          { label: 'C', text: '50%', isCorrect: false },
          { label: 'D', text: '66.7%', isCorrect: false }
        ]
      },
      {
        questionNumber: 2,
        questionText: 'Using the same scenario (200 contain A, 100 contain both A and B), what is the confidence of the rule A => B?',
        options: [
          { label: 'A', text: '10%', isCorrect: false },
          { label: 'B', text: '50% (100 / 200)', isCorrect: true },
          { label: 'C', text: '66.7%', isCorrect: false },
          { label: 'D', text: '20%', isCorrect: false }
        ]
      },
      {
        questionNumber: 3,
        questionText: 'What is the core statement of the Apriori Property (downward closure of support)?',
        options: [
          { label: 'A', text: 'All supersets of an infrequent itemset are frequent.', isCorrect: false },
          { label: 'B', text: 'All nonempty subsets of a frequent itemset must also be frequent.', isCorrect: true },
          { label: 'C', text: 'Itemsets with high support always have high confidence.', isCorrect: false },
          { label: 'D', text: 'Support increases as itemset size increases.', isCorrect: false }
        ]
      },
      {
        questionNumber: 4,
        questionText: 'If itemset {Bread, Butter} is found to be INFREQUENT at min_sup = 5%, what can we immediately conclude about itemset {Bread, Butter, Jam}?',
        options: [
          { label: 'A', text: 'It is guaranteed to be frequent.', isCorrect: false },
          { label: 'B', text: 'It can be immediately pruned without scanning the database because it is also infrequent.', isCorrect: true },
          { label: 'C', text: 'Its support is 100%.', isCorrect: false },
          { label: 'D', text: 'It has confidence equal to 1.0.', isCorrect: false }
        ]
      },
      {
        questionNumber: 5,
        questionText: 'What is the purpose of the "Prune Step" in the Apriori algorithm during candidate generation?',
        options: [
          { label: 'A', text: 'To delete empty database rows', isCorrect: false },
          { label: 'B', text: 'To remove any candidate k-itemset whose (k-1)-subsets are not all frequent', isCorrect: true },
          { label: 'C', text: 'To eliminate customers with duplicate accounts', isCorrect: false },
          { label: 'D', text: 'To encrypt sensitive transactions', isCorrect: false }
        ]
      },
      {
        questionNumber: 6,
        questionText: 'An association rule that satisfies both the minimum support threshold and the minimum confidence threshold is termed:',
        options: [
          { label: 'A', text: 'A strong association rule', isCorrect: true },
          { label: 'B', text: 'A redundant hypothesis', isCorrect: false },
          { label: 'C', text: 'An overfitted classifier', isCorrect: false },
          { label: 'D', text: 'A closed boundary', isCorrect: false }
        ]
      },
      {
        questionNumber: 7,
        questionText: 'In Apriori candidate generation, two frequent (k-1)-itemsets are joined if and only if:',
        options: [
          { label: 'A', text: 'They share the first (k-2) items in common (under lexicographical ordering).', isCorrect: true },
          { label: 'B', text: 'They share completely disjoint items.', isCorrect: false },
          { label: 'C', text: 'Their support counts are both odd numbers.', isCorrect: false },
          { label: 'D', text: 'They have identical transaction timestamps.', isCorrect: false }
        ]
      },
      {
        questionNumber: 8,
        questionText: 'How many non-empty candidate itemsets can theoretically be formed from a vocabulary of d distinct items?',
        options: [
          { label: 'A', text: '2^d - 1', isCorrect: true },
          { label: 'B', text: 'd^2', isCorrect: false },
          { label: 'C', text: 'd!', isCorrect: false },
          { label: 'D', text: '2 * d', isCorrect: false }
        ]
      },
      {
        questionNumber: 9,
        questionText: 'What is the primary computational bottleneck of the standard Apriori algorithm when processing large databases?',
        options: [
          { label: 'A', text: 'Multiple iterative full database scans and huge candidate itemset generation', isCorrect: true },
          { label: 'B', text: 'Lack of support for integer calculations', isCorrect: false },
          { label: 'C', text: 'Inability to handle more than 3 transactions', isCorrect: false },
          { label: 'D', text: 'Excessive network latency between RAM and CPU cache', isCorrect: false }
        ]
      },
      {
        questionNumber: 10,
        questionText: 'If the support count of itemset {Milk} is 40 and the support count of {Milk, Bread} is 30 in a dataset of 100 transactions, what is the confidence of {Milk} => {Bread}?',
        options: [
          { label: 'A', text: '75% (30 / 40)', isCorrect: true },
          { label: 'B', text: '30%', isCorrect: false },
          { label: 'C', text: '40%', isCorrect: false },
          { label: 'D', text: '133%', isCorrect: false }
        ]
      },
      {
        questionNumber: 11,
        questionText: 'Which of the following describes a k-itemset?',
        options: [
          { label: 'A', text: 'An itemset containing exactly k distinct items', isCorrect: true },
          { label: 'B', text: 'An itemset that appears in exactly k transactions', isCorrect: false },
          { label: 'C', text: 'An itemset with a support percentage of k%', isCorrect: false },
          { label: 'D', text: 'An algorithm running in k iterations', isCorrect: false }
        ]
      },
      {
        questionNumber: 12,
        questionText: 'If {A, B, C} is a frequent 3-itemset, which of the following MUST be frequent according to the Apriori property?',
        options: [
          { label: 'A', text: '{A}, {B}, {C}, {A, B}, {A, C}, and {B, C}', isCorrect: true },
          { label: 'B', text: '{A, B, C, D}', isCorrect: false },
          { label: 'C', text: '{A, B, C, E}', isCorrect: false },
          { label: 'D', text: 'All possible 4-itemsets in the database', isCorrect: false }
        ]
      },
      {
        questionNumber: 13,
        questionText: 'What data structure is frequently used in Apriori to accelerate candidate support counting?',
        options: [
          { label: 'A', text: 'Hash tree', isCorrect: true },
          { label: 'B', text: 'Adjacency list', isCorrect: false },
          { label: 'C', text: 'Binary search tree', isCorrect: false },
          { label: 'D', text: 'Circular ring buffer', isCorrect: false }
        ]
      },
      {
        questionNumber: 14,
        questionText: 'Can an association rule X => Y have higher support than the support of X alone?',
        options: [
          { label: 'A', text: 'No, because Support(X ∪ Y) is bounded above by Support(X).', isCorrect: true },
          { label: 'B', text: 'Yes, if confidence is 100%.', isCorrect: false },
          { label: 'C', text: 'Yes, if Y contains more items than X.', isCorrect: false },
          { label: 'D', text: 'Yes, if the minimum support threshold is zero.', isCorrect: false }
        ]
      },
      {
        questionNumber: 15,
        questionText: 'Why can high confidence sometimes be deceptive in practical retail market basket analysis?',
        options: [
          { label: 'A', text: 'Because if the consequent Y is extremely popular overall, Conf(X => Y) will be artificially high even if X and Y are completely independent.', isCorrect: true },
          { label: 'B', text: 'Because confidence cannot exceed 50%.', isCorrect: false },
          { label: 'C', text: 'Because confidence is only calculated on negative transactions.', isCorrect: false },
          { label: 'D', text: 'Because confidence ignores the antecedent X entirely.', isCorrect: false }
        ]
      },
      {
        questionNumber: 16,
        questionText: 'What is the maximum number of association rules that can be generated from a frequent itemset L of size k?',
        options: [
          { label: 'A', text: '2^k - 2', isCorrect: true },
          { label: 'B', text: 'k!', isCorrect: false },
          { label: 'C', text: 'k^2', isCorrect: false },
          { label: 'D', text: '2 * k', isCorrect: false }
        ]
      },
      {
        questionNumber: 17,
        questionText: 'In Apriori, if L_3 has 4 itemsets, what is the maximum number of candidates that can be produced in C_4?',
        options: [
          { label: 'A', text: '1 candidate', isCorrect: true },
          { label: 'B', text: '16 candidates', isCorrect: false },
          { label: 'C', text: '64 candidates', isCorrect: false },
          { label: 'D', text: '4 candidates', isCorrect: false }
        ]
      },
      {
        questionNumber: 18,
        questionText: 'How is transactional database D typically represented during standard horizontal data mining?',
        options: [
          { label: 'A', text: 'Each row corresponds to a Transaction ID (TID) followed by a list of items bought.', isCorrect: true },
          { label: 'B', text: 'Each row corresponds to an item followed by all transactions containing it.', isCorrect: false },
          { label: 'C', text: 'A single floating-point number', isCorrect: false },
          { label: 'D', text: 'An unindexed linked graph of users', isCorrect: false }
        ]
      },
      {
        questionNumber: 19,
        questionText: 'If min_sup is set too low by an analyst, what operational hazard occurs in the Apriori algorithm?',
        options: [
          { label: 'A', text: 'Combinatorial explosion of candidate itemsets and out-of-memory errors', isCorrect: true },
          { label: 'B', text: 'Zero candidate itemsets generated', isCorrect: false },
          { label: 'C', text: 'Automatic termination without scanning data', isCorrect: false },
          { label: 'D', text: 'All confidence values become negative', isCorrect: false }
        ]
      },
      {
        questionNumber: 20,
        questionText: 'What property of association rules indicates that rule X => Y is mathematically identical in support to rule Y => X?',
        options: [
          { label: 'A', text: 'Support is symmetric because Support(X ∪ Y) = Support(Y ∪ X).', isCorrect: true },
          { label: 'B', text: 'Confidence is symmetric.', isCorrect: false },
          { label: 'C', text: 'Both support and confidence are always symmetric.', isCorrect: false },
          { label: 'D', text: 'Neither metric is symmetric.', isCorrect: false }
        ]
      }
    ]
  },

  // ===================== CHAPTER 5 =====================
  {
    chapterNumber: 5,
    moduleNumber: 2,
    title: 'Pattern Mining: Advanced Methods',
    description: 'FP-Growth algorithm, FP-Tree construction, mining without candidate generation, closed/maximal itemsets, and correlation metrics.',
    overview: 'While the Apriori algorithm is conceptually elegant, its candidate generation and repetitive database scans present major bottlenecks. The Frequent Pattern Growth (FP-Growth) algorithm adopts a divide-and-conquer strategy, compressing transactional databases into a highly compact Frequent Pattern Tree (FP-Tree) and mining frequent itemsets directly without generating candidate sets. This chapter also explores closed and maximal itemsets, alongside advanced correlation measures including Lift and Chi-Square.',
    objectives: [
      'Construct a compact FP-Tree from ordered frequent items in transactional data.',
      'Execute the FP-Growth divide-and-conquer algorithm using conditional pattern bases and conditional FP-trees.',
      'Differentiate between frequent itemsets, closed frequent itemsets, and maximal frequent itemsets.',
      'Compute and interpret correlation evaluation metrics: Lift, Chi-Square, and Max-Confidence.'
    ],
    content: `## 1. The FP-Growth Algorithm
FP-Growth mines frequent patterns without candidate generation:
1. **Pass 1**: Scan database, count item frequencies, and discard infrequent items. Sort frequent items in descending support order (the frequency order).
2. **Pass 2**: Insert transactions into an **FP-Tree**, sharing prefixes among transactions with common items. A header table with linked lists links tree nodes of identical items.
3. **Mining the FP-Tree**:
   - For each item in reverse frequency order, construct its **Conditional Pattern Base** (sub-paths ending at that item).
   - Construct its **Conditional FP-Tree**.
   - Recursively mine the conditional tree until the tree is empty or contains a single path.

## 2. Closed vs. Maximal Frequent Itemsets
- **Frequent Itemset**: An itemset whose support $\\ge \\text{min\\_sup}$.
- **Closed Frequent Itemset**: A frequent itemset $X$ such that there exists no proper superset $Y \\supset X$ with $\\text{Support}(Y) = \\text{Support}(X)$. Retains complete support information for all subsets without loss.
- **Maximal Frequent Itemset**: A frequent itemset $X$ such that no proper superset $Y \\supset X$ is frequent. Lossy representation (does not preserve exact subset supports).

## 3. Beyond Support-Confidence: Correlation Measures
- **Lift**: Measures the ratio of observed joint occurrence to expected independent occurrence:
$$\\text{Lift}(A \\implies B) = \\frac{P(A \\cup B)}{P(A) \\cdot P(B)} = \\frac{\\text{Confidence}(A \\implies B)}{\\text{Support}(B)}$$
  - $\\text{Lift} = 1$: $A$ and $B$ are statistically independent.
  - $\\text{Lift} > 1$: $A$ and $B$ are positively correlated.
  - $\\text{Lift} < 1$: $A$ and $B$ are negatively correlated.`,
    keyConcepts: 'FP-Tree, FP-Growth, Header Table, Conditional Pattern Base, Conditional FP-Tree, Closed Itemsets, Maximal Itemsets, Lift.',
    slides: [
      { title: 'The FP-Growth Paradigm', subtitle: 'Chapter 5: Advanced Pattern Mining', bullets: ['Mining frequent itemsets without candidate generation', 'Compacting transactional records into an in-memory prefix tree', 'Only two physical database scans required'] },
      { title: 'FP-Tree Structural Anatomy', subtitle: 'Divide-and-Conquer Prefix Tree', bullets: ['Root labeled null with frequency-ordered branches', 'Header table storing item frequencies and node-links', 'Shared prefixes compress millions of transactions'] },
      { title: 'Closed vs Maximal Itemsets', subtitle: 'Lossless vs Lossy Representation', bullets: ['Closed: No superset has identical support (lossless)', 'Maximal: No superset is frequent (lossy but tiny)', 'Drastic reduction in reported association rule volume'] },
      { title: 'Evaluating Rule Correlation with Lift', subtitle: 'Beyond Raw Confidence', bullets: ['Lift = P(A, B) / [P(A) * P(B)]', 'Lift > 1: Genuine positive association', 'Lift < 1: Mutual exclusivity / substitution effect'] }
    ],
    questions: [
      {
        questionNumber: 1,
        questionText: 'How many database scans does the FP-Growth algorithm perform to construct the global FP-Tree?',
        options: [
          { label: 'A', text: 'Exactly 2 scans', isCorrect: true },
          { label: 'B', text: 'As many scans as the length of the longest transaction', isCorrect: false },
          { label: 'C', text: '100 scans', isCorrect: false },
          { label: 'D', text: '0 scans (it operates without reading storage)', isCorrect: false }
        ]
      },
      {
        questionNumber: 2,
        questionText: 'In FP-Tree construction, why are items within each transaction sorted in descending order of their global support frequency?',
        options: [
          { label: 'A', text: 'To maximize prefix-sharing among transactions, drastically compressing the tree size', isCorrect: true },
          { label: 'B', text: 'Because MySQL requires ascending string orders', isCorrect: false },
          { label: 'C', text: 'To ensure all leaf nodes have identical names', isCorrect: false },
          { label: 'D', text: 'To delete half of the transactions automatically', isCorrect: false }
        ]
      },
      {
        questionNumber: 3,
        questionText: 'What is a "Conditional Pattern Base" for an item X in FP-Growth?',
        options: [
          { label: 'A', text: 'A collection of prefix paths in the FP-Tree co-occurring with item X, treated as sub-transactions', isCorrect: true },
          { label: 'B', text: 'The original un-parsed database log file', isCorrect: false },
          { label: 'C', text: 'A list of items that have zero support', isCorrect: false },
          { label: 'D', text: 'A random sample of transactions', isCorrect: false }
        ]
      },
      {
        questionNumber: 4,
        questionText: 'A frequent itemset is defined as "Closed" if:',
        options: [
          { label: 'A', text: 'None of its proper supersets have the same support as itself.', isCorrect: true },
          { label: 'B', text: 'None of its proper supersets are frequent.', isCorrect: false },
          { label: 'C', text: 'Its support is strictly equal to 100%.', isCorrect: false },
          { label: 'D', text: 'It contains fewer than 2 items.', isCorrect: false }
        ]
      },
      {
        questionNumber: 5,
        questionText: 'A frequent itemset is defined as "Maximal" if:',
        options: [
          { label: 'A', text: 'None of its proper supersets are frequent.', isCorrect: true },
          { label: 'B', text: 'It contains the maximum number of transactions.', isCorrect: false },
          { label: 'C', text: 'Its confidence is 1.0.', isCorrect: false },
          { label: 'D', text: 'It was discovered by the Apriori algorithm.', isCorrect: false }
        ]
      },
      {
        questionNumber: 6,
        questionText: 'If Support(A) = 0.40, Support(B) = 0.50, and Support(A ∪ B) = 0.20, what is the Lift of rule A => B?',
        options: [
          { label: 'A', text: '1.0 (indicating statistical independence)', isCorrect: true },
          { label: 'B', text: '2.5', isCorrect: false },
          { label: 'C', text: '0.5', isCorrect: false },
          { label: 'D', text: '0.1', isCorrect: false }
        ]
      },
      {
        questionNumber: 7,
        questionText: 'If the Lift of association rule Coffee => Tea is 0.45, what does this value signify?',
        options: [
          { label: 'A', text: 'A negative correlation / substitution effect (purchasing coffee actually decreases the likelihood of purchasing tea)', isCorrect: true },
          { label: 'B', text: 'A strong positive affinity where one causes the other', isCorrect: false },
          { label: 'C', text: 'That the rule is 100% accurate', isCorrect: false },
          { label: 'D', text: 'That neither product exists in the store', isCorrect: false }
        ]
      },
      {
        questionNumber: 8,
        questionText: 'Why is mining Closed Frequent Itemsets considered "lossless", whereas mining Maximal Frequent Itemsets is "lossy"?',
        options: [
          { label: 'A', text: 'Closed itemsets allow exact reconstruction of the support of every frequent itemset, whereas maximal itemsets do not retain exact subset support counts.', isCorrect: true },
          { label: 'B', text: 'Closed itemsets lose 50% of records during compression.', isCorrect: false },
          { label: 'C', text: 'Maximal itemsets require lossless PNG image formats.', isCorrect: false },
          { label: 'D', text: 'Neither format has any mathematical validity.', isCorrect: false }
        ]
      },
      {
        questionNumber: 9,
        questionText: 'In the FP-Tree data structure, what role is served by the "Header Table"?',
        options: [
          { label: 'A', text: 'It maintains head-of-linked-list pointers connecting all tree nodes sharing the same item label across different tree branches.', isCorrect: true },
          { label: 'B', text: 'It stores HTTP headers from web client requests.', isCorrect: false },
          { label: 'C', text: 'It records encryption passwords for the database.', isCorrect: false },
          { label: 'D', text: 'It acts as an operating system kernel dispatch table.', isCorrect: false }
        ]
      },
      {
        questionNumber: 10,
        questionText: 'When does the recursive mining of a conditional FP-Tree terminate in the FP-Growth procedure?',
        options: [
          { label: 'A', text: 'When the resulting conditional FP-Tree is empty or consists of a single linear prefix path', isCorrect: true },
          { label: 'B', text: 'When 1,000 rules have been printed', isCorrect: false },
          { label: 'C', text: 'When the operating system sends an interrupt signal', isCorrect: false },
          { label: 'D', text: 'When all numbers are converted to strings', isCorrect: false }
        ]
      },
      {
        questionNumber: 11,
        questionText: 'Which correlation metric is null-invariant (meaning its calculated value is unaffected by the number of transactions that contain neither item A nor item B)?',
        options: [
          { label: 'A', text: 'Chi-Square (χ²)', isCorrect: false },
          { label: 'B', text: 'Max-Confidence and Cosine measure', isCorrect: true },
          { label: 'C', text: 'Simple Euclidean distance', isCorrect: false },
          { label: 'D', text: 'Standard variance', isCorrect: false }
        ]
      },
      {
        questionNumber: 12,
        questionText: 'Why is null-invariance an essential property for correlation measures in massive web transactional databases?',
        options: [
          { label: 'A', text: 'Because transactions that contain neither item overwhelmingly dominate the dataset, which would otherwise heavily distort non-null-invariant metrics like Chi-Square.', isCorrect: true },
          { label: 'B', text: 'Because null values crash database drivers.', isCorrect: false },
          { label: 'C', text: 'Because web databases have no transactions.', isCorrect: false },
          { label: 'D', text: 'Because null-invariance forces all lift values to zero.', isCorrect: false }
        ]
      },
      {
        questionNumber: 13,
        questionText: 'What algorithm transforms the mining problem into a vertical data format (TID-lists per item) using set intersections?',
        options: [
          { label: 'A', text: 'ECLAT (Equivalence CLASS Transformation)', isCorrect: true },
          { label: 'B', text: 'K-Means', isCorrect: false },
          { label: 'C', text: 'DBSCAN', isCorrect: false },
          { label: 'D', text: 'PageRank', isCorrect: false }
        ]
      },
      {
        questionNumber: 14,
        questionText: 'In ECLAT, how is the support count of itemset {A, B} computed from the vertical TID-lists of A and B?',
        options: [
          { label: 'A', text: 'By computing the cardinality of the intersection of TID-list(A) and TID-list(B)', isCorrect: true },
          { label: 'B', text: 'By adding the lengths of both lists together', isCorrect: false },
          { label: 'C', text: 'By computing the inverse Fourier transform', isCorrect: false },
          { label: 'D', text: 'By scanning the raw transactions from scratch', isCorrect: false }
        ]
      },
      {
        questionNumber: 15,
        questionText: 'If every frequent itemset in a database has distinct support values, what is the relationship between the set of Frequent Itemsets (F) and Closed Itemsets (C)?',
        options: [
          { label: 'A', text: 'F = C (every frequent itemset is also a closed itemset)', isCorrect: true },
          { label: 'B', text: 'C is completely empty', isCorrect: false },
          { label: 'C', text: 'F contains zero items', isCorrect: false },
          { label: 'D', text: 'Maximal itemsets cannot exist', isCorrect: false }
        ]
      },
      {
        questionNumber: 16,
        questionText: 'Can a maximal frequent itemset ever fail to be a closed frequent itemset?',
        options: [
          { label: 'A', text: 'No, every maximal frequent itemset is inherently closed by definition.', isCorrect: true },
          { label: 'B', text: 'Yes, maximal itemsets are never closed.', isCorrect: false },
          { label: 'C', text: 'Yes, if support is below 1%.', isCorrect: false },
          { label: 'D', text: 'Only when using the Apriori algorithm.', isCorrect: false }
        ]
      },
      {
        questionNumber: 17,
        questionText: 'In an FP-Tree node, what information is stored alongside the item identifier?',
        options: [
          { label: 'A', text: 'Support count (number of transactions sharing this path) and parent/child/sibling node-link pointers', isCorrect: true },
          { label: 'B', text: 'The customer\'s credit card number', isCorrect: false },
          { label: 'C', text: 'The SQL connection string', isCorrect: false },
          { label: 'D', text: 'A random floating-point weight', isCorrect: false }
        ]
      },
      {
        questionNumber: 18,
        questionText: 'What is a multi-level association rule?',
        options: [
          { label: 'A', text: 'A rule mined across different levels of abstraction within a concept hierarchy (e.g., Computer => HP_Printer vs Dell_Laptop => Laser_Printer)', isCorrect: true },
          { label: 'B', text: 'A rule that requires multi-factor authentication', isCorrect: false },
          { label: 'C', text: 'A rule with multiple database passwords', isCorrect: false },
          { label: 'D', text: 'A rule that executes in a nested virtual machine', isCorrect: false }
        ]
      },
      {
        questionNumber: 19,
        questionText: 'What is quantitative association rule mining?',
        options: [
          { label: 'A', text: 'Mining association rules from datasets containing numeric and continuous attributes (e.g., Age(X, "20..29") ∧ Income(X, "50K..70K") => Buys(X, "HDTV"))', isCorrect: true },
          { label: 'B', text: 'Counting the number of letters in a rule', isCorrect: false },
          { label: 'C', text: 'Mining rules using quantum computers', isCorrect: false },
          { label: 'D', text: 'Rules that contain no items', isCorrect: false }
        ]
      },
      {
        questionNumber: 20,
        questionText: 'Why does the FP-Growth algorithm generally outperform Apriori by orders of magnitude on dense datasets?',
        options: [
          { label: 'A', text: 'Because dense datasets generate vast combinatorial explosions of candidate sets in Apriori, while FP-Tree compacts the patterns and eliminates candidate generation entirely.', isCorrect: true },
          { label: 'B', text: 'Because FP-Growth ignores transactions with more than 3 items.', isCorrect: false },
          { label: 'C', text: 'Because Apriori is written only in interpreted shells.', isCorrect: false },
          { label: 'D', text: 'Because FP-Growth approximates answers rather than finding exact frequent itemsets.', isCorrect: false }
        ]
      }
    ]
  },

  // ===================== CHAPTER 6 =====================
  {
    chapterNumber: 6,
    moduleNumber: 3,
    title: 'Classification: Basic Concepts and Methods',
    description: 'Supervised learning, decision tree induction, entropy, information gain, Gini index, Naive Bayes, and confusion matrices.',
    overview: 'Classification is the fundamental supervised learning task of mapping input feature vectors into discrete categorical class labels. This chapter explores decision tree induction algorithms (ID3, C4.5, CART), attribute selection metrics (Information Gain, Gain Ratio, Gini Index), Bayesian classifiers founded upon conditional independence, and model evaluation via Confusion Matrices, Accuracy, Precision, Recall, and F1-Score.',
    objectives: [
      'Contrast supervised classification with unsupervised clustering paradigms.',
      'Construct decision trees using Information Gain (Entropy), Gain Ratio, and Gini Index.',
      'Formulate and execute a Naive Bayes classifier applying Laplace smoothing.',
      'Calculate and interpret evaluation metrics: Confusion Matrix, Accuracy, Precision, Recall, and F1-Score.'
    ],
    content: `## 1. What is Classification?
Classification is a two-step supervised learning process:
1. **Learning (Training Phase)**: A classification model is constructed from a labeled training set $\\{(x_i, y_i)\\}$.
2. **Classification (Testing Phase)**: The trained model predicts the class label $y$ for unseen test samples $x$, and its accuracy is measured against ground-truth labels.

## 2. Decision Tree Induction
Decision trees partition the attribute space into mutually exclusive regions:
- **Entropy** measures impurity in dataset $D$:
$$H(D) = -\\sum_{i=1}^{m} p_i \\log_2(p_i)$$
- **Information Gain (ID3)**: Reduction in entropy achieved by partitioning on attribute $A$:
$$\\text{Gain}(D, A) = H(D) - \\sum_{v \\in \\text{Values}(A)} \\frac{|D_v|}{|D|} H(D_v)$$
*Biased towards attributes with many distinct values.*
- **Gain Ratio (C4.5)**: Normalizes Gain by Split Information to overcome the multi-value bias:
$$\\text{SplitInfo}_A(D) = -\\sum_{v} \\frac{|D_v|}{|D|} \\log_2\\left(\\frac{|D_v|}{|D|}\\right), \\quad \\text{GainRatio}(D, A) = \\frac{\\text{Gain}(D, A)}{\\text{SplitInfo}_A(D)}$$
- **Gini Index (CART)**: Impurity metric used for binary splits:
$$\\text{Gini}(D) = 1 - \\sum_{i=1}^{m} p_i^2$$

## 3. Naive Bayes Classifier
Applies Bayes' Theorem assuming conditional independence between features given the class:
$$P(C_k \\mid X) = \\frac{P(X \\mid C_k) P(C_k)}{P(X)} \\propto P(C_k) \\prod_{j=1}^{d} P(x_j \\mid C_k)$$
- **Laplace Correction**: Adds 1 to frequency counts to prevent zero-probability products when an attribute value is unobserved in training data.

## 4. Model Evaluation Metrics
Given a Confusion Matrix with TP, FP, FN, TN:
- **Accuracy**: $\\frac{TP + TN}{TP + TN + FP + FN}$
- **Precision**: $\\frac{TP}{TP + FP}$ (Fraction of predicted positives that were true)
- **Recall (Sensitivity)**: $\\frac{TP}{TP + FN}$ (Fraction of actual positives correctly identified)
- **F1-Score**: Harmonic mean of Precision and Recall:
$$F1 = 2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}$$`,
    keyConcepts: 'Supervised Learning, Decision Tree, Entropy, Information Gain, Gain Ratio, Gini Index, Naive Bayes, Laplace Correction, Confusion Matrix, Precision, Recall, F1-Score.',
    slides: [
      { title: 'Supervised Classification', subtitle: 'Chapter 6: Basic Classification', bullets: ['Mapping attribute vectors to categorical target labels', 'Training phase vs independent testing phase', 'Preventing data leakage and optimistic bias'] },
      { title: 'Decision Tree Splitting Metrics', subtitle: 'Measuring Node Impurity', bullets: ['Entropy & Information Gain (ID3): Reductive uncertainty', 'Gain Ratio (C4.5): Penalizing high-branching cardinalities', 'Gini Impurity (CART): Binary recursive partitioning'] },
      { title: 'The Naive Bayes Classifier', subtitle: 'Probabilistic Inductive Inference', bullets: ['Bayes Theorem: Prior x Likelihood / Marginal', 'Class-conditional independence assumption', 'Laplace correction to eliminate zero-frequency vetoes'] },
      { title: 'Confusion Matrix & Metrics', subtitle: 'Quantifying Model Performance', bullets: ['Accuracy: Misleading under severe class imbalance', 'Precision vs Recall trade-off', 'F1-Score: Harmonic mean of precision and recall'] }
    ],
    questions: [
      {
        questionNumber: 1,
        questionText: 'What fundamental characteristic distinguishes supervised classification from unsupervised clustering?',
        options: [
          { label: 'A', text: 'Classification utilizes training datasets with pre-labeled ground-truth target classes, whereas clustering groups unlabeled data.', isCorrect: true },
          { label: 'B', text: 'Classification can only handle numeric numbers.', isCorrect: false },
          { label: 'C', text: 'Clustering requires knowing the exact target labels in advance.', isCorrect: false },
          { label: 'D', text: 'Classification algorithms never make errors.', isCorrect: false }
        ]
      },
      {
        questionNumber: 2,
        questionText: 'If a dataset D contains 16 positive examples and 16 negative examples (equal proportion), what is the exact Shannon Entropy H(D)?',
        options: [
          { label: 'A', text: '1.0 bit', isCorrect: true },
          { label: 'B', text: '0.0 bits', isCorrect: false },
          { label: 'C', text: '0.5 bits', isCorrect: false },
          { label: 'D', text: '16.0 bits', isCorrect: false }
        ]
      },
      {
        questionNumber: 3,
        questionText: 'What is the entropy of a completely pure leaf node in a decision tree where all 50 samples belong to Class A?',
        options: [
          { label: 'A', text: '0.0 bits (zero uncertainty)', isCorrect: true },
          { label: 'B', text: '1.0 bit', isCorrect: false },
          { label: 'C', text: '50.0 bits', isCorrect: false },
          { label: 'D', text: '-1.0 bit', isCorrect: false }
        ]
      },
      {
        questionNumber: 4,
        questionText: 'Why does the ID3 algorithm\'s Information Gain metric exhibit an undesirable bias towards selecting attributes with a vast number of unique values (such as Customer_ID)?',
        options: [
          { label: 'A', text: 'Because partitioning on a unique ID creates pure single-sample leaf nodes, yielding an artificially high Information Gain despite having zero predictive utility.', isCorrect: true },
          { label: 'B', text: 'Because ID3 cannot calculate logarithms.', isCorrect: false },
          { label: 'C', text: 'Because customer IDs have zero entropy.', isCorrect: false },
          { label: 'D', text: 'Because ID3 is an unsupervised algorithm.', isCorrect: false }
        ]
      },
      {
        questionNumber: 5,
        questionText: 'How does the C4.5 algorithm overcome ID3\'s bias towards high-cardinality attributes?',
        options: [
          { label: 'A', text: 'By dividing Information Gain by the attribute\'s Split Information (Gain Ratio)', isCorrect: true },
          { label: 'B', text: 'By deleting all text columns from the dataset', isCorrect: false },
          { label: 'C', text: 'By switching to an artificial neural network', isCorrect: false },
          { label: 'D', text: 'By setting entropy to a random constant', isCorrect: false }
        ]
      },
      {
        questionNumber: 6,
        questionText: 'Which splitting metric is standardly employed by the CART (Classification and Regression Trees) algorithm?',
        options: [
          { label: 'A', text: 'Gini Index', isCorrect: true },
          { label: 'B', text: 'Shannon Entropy', isCorrect: false },
          { label: 'C', text: 'Pearson r', isCorrect: false },
          { label: 'D', text: 'Euclidean distance', isCorrect: false }
        ]
      },
      {
        questionNumber: 7,
        questionText: 'What foundational assumption underlies the "Naive" Bayes classifier?',
        options: [
          { label: 'A', text: 'Attributes are conditionally independent of each other given the class label.', isCorrect: true },
          { label: 'B', text: 'All attributes follow a uniform distribution.', isCorrect: false },
          { label: 'C', text: 'The dataset has zero training errors.', isCorrect: false },
          { label: 'D', text: 'Attributes must be continuous floating-point variables.', isCorrect: false }
        ]
      },
      {
        questionNumber: 8,
        questionText: 'Why is Laplace correction (Laplace smoothing) applied in Naive Bayes classification?',
        options: [
          { label: 'A', text: 'To prevent zero-probability values from completely zeroing out the entire posterior probability product when a feature value was unobserved in training data', isCorrect: true },
          { label: 'B', text: 'To encrypt the model weights against hackers', isCorrect: false },
          { label: 'C', text: 'To force all predictions to match the majority class', isCorrect: false },
          { label: 'D', text: 'To convert categorical variables into images', isCorrect: false }
        ]
      },
      {
        questionNumber: 9,
        questionText: 'In a medical diagnostic test, 90 patients with a disease test positive (TP), 10 patients with the disease test negative (FN), and 20 healthy patients test positive (FP). What is the Sensitivity (Recall)?',
        options: [
          { label: 'A', text: '90% (90 / (90 + 10))', isCorrect: true },
          { label: 'B', text: '81.8% (90 / (90 + 20))', isCorrect: false },
          { label: 'C', text: '50%', isCorrect: false },
          { label: 'D', text: '10%', isCorrect: false }
        ]
      },
      {
        questionNumber: 10,
        questionText: 'Using the same diagnostic data (TP = 90, FP = 20), what is the Precision of the positive test result?',
        options: [
          { label: 'A', text: '81.8% (90 / (90 + 20))', isCorrect: true },
          { label: 'B', text: '90%', isCorrect: false },
          { label: 'C', text: '75%', isCorrect: false },
          { label: 'D', text: '45%', isCorrect: false }
        ]
      },
      {
        questionNumber: 11,
        questionText: 'What is the F1-Score?',
        options: [
          { label: 'A', text: 'The harmonic mean of Precision and Recall', isCorrect: true },
          { label: 'B', text: 'The arithmetic mean of Accuracy and Error rate', isCorrect: false },
          { label: 'C', text: 'The sum of True Positives and True Negatives', isCorrect: false },
          { label: 'D', text: 'The ratio of false alarms to true alarms', isCorrect: false }
        ]
      },
      {
        questionNumber: 12,
        questionText: 'Why is standard Classification Accuracy an unreliable performance metric on highly imbalanced datasets (e.g., credit card fraud where 99.9% of transactions are legitimate)?',
        options: [
          { label: 'A', text: 'A trivial classifier predicting "legitimate" for 100% of cases achieves 99.9% accuracy while detecting zero fraud.', isCorrect: true },
          { label: 'B', text: 'Accuracy cannot be expressed as a percentage.', isCorrect: false },
          { label: 'C', text: 'Because imbalanced data crashes the CPU.', isCorrect: false },
          { label: 'D', text: 'Because true negatives are mathematically impossible to count.', isCorrect: false }
        ]
      },
      {
        questionNumber: 13,
        questionText: 'What occurs when a decision tree algorithm is allowed to grow unchecked until every leaf node contains only 1 sample?',
        options: [
          { label: 'A', text: 'Overfitting (high variance, poor generalization to unseen data)', isCorrect: true },
          { label: 'B', text: 'Underfitting (high bias)', isCorrect: false },
          { label: 'C', text: 'Perfect real-world generalization', isCorrect: false },
          { label: 'D', text: 'Zero training and testing error forever', isCorrect: false }
        ]
      },
      {
        questionNumber: 14,
        questionText: 'Which decision tree pruning strategy removes branches after the tree has grown fully, replacing subtrees with leaves if validation error improves?',
        options: [
          { label: 'A', text: 'Post-pruning (e.g., Cost-Complexity Pruning)', isCorrect: true },
          { label: 'B', text: 'Pre-pruning (early stopping)', isCorrect: false },
          { label: 'C', text: 'Binning', isCorrect: false },
          { label: 'D', text: 'Bootstrap aggregation', isCorrect: false }
        ]
      },
      {
        questionNumber: 15,
        questionText: 'In k-Fold Cross-Validation, how is the original dataset partitioned?',
        options: [
          { label: 'A', text: 'Divided into k equal-sized folds; the model is trained on k-1 folds and evaluated on the remaining fold, repeated k times.', isCorrect: true },
          { label: 'B', text: 'Split into k completely random clusters without labels.', isCorrect: false },
          { label: 'C', text: 'Stored across k different database servers.', isCorrect: false },
          { label: 'D', text: 'Multiplied by a factor of k.', isCorrect: false }
        ]
      },
      {
        questionNumber: 16,
        questionText: 'What is a "Type I Error" in statistical hypothesis testing and binary classification?',
        options: [
          { label: 'A', text: 'False Positive (rejecting a true null hypothesis)', isCorrect: true },
          { label: 'B', text: 'False Negative (failing to reject a false null hypothesis)', isCorrect: false },
          { label: 'C', text: 'True Positive', isCorrect: false },
          { label: 'D', text: 'Division by zero error', isCorrect: false }
        ]
      },
      {
        questionNumber: 17,
        questionText: 'What is a "Type II Error" in binary classification?',
        options: [
          { label: 'A', text: 'False Negative (missing a true positive condition)', isCorrect: true },
          { label: 'B', text: 'False Positive', isCorrect: false },
          { label: 'C', text: 'True Negative', isCorrect: false },
          { label: 'D', text: 'Data type mismatch', isCorrect: false }
        ]
      },
      {
        questionNumber: 18,
        questionText: 'In a Naive Bayes classifier, how are continuous numerical attributes typically modeled?',
        options: [
          { label: 'A', text: 'By assuming a continuous Gaussian (Normal) probability density function for each class, or by prior discretization', isCorrect: true },
          { label: 'B', text: 'By rounding all values to zero', isCorrect: false },
          { label: 'C', text: 'By treating every distinct floating-point number as a unique string label', isCorrect: false },
          { label: 'D', text: 'Continuous variables are strictly prohibited in Naive Bayes', isCorrect: false }
        ]
      },
      {
        questionNumber: 19,
        questionText: 'What does a decision boundary represent in feature space?',
        options: [
          { label: 'A', text: 'A hypersurface that partitions the feature space into distinct predicted class labels', isCorrect: true },
          { label: 'B', text: 'The physical edge of the silicon chip', isCorrect: false },
          { label: 'C', text: 'The maximum RAM capacity of the server', isCorrect: false },
          { label: 'D', text: 'The outer boundary of a database index', isCorrect: false }
        ]
      },
      {
        questionNumber: 20,
        questionText: 'Why are Decision Trees considered "white-box" models compared to deep neural networks?',
        options: [
          { label: 'A', text: 'Because their classification logic can be directly translated into intuitive, human-interpretable IF-THEN rules.', isCorrect: true },
          { label: 'B', text: 'Because they are displayed with a white background on monitors.', isCorrect: false },
          { label: 'C', text: 'Because they can only run on white servers.', isCorrect: false },
          { label: 'D', text: 'Because they contain zero mathematical formulas.', isCorrect: false }
        ]
      }
    ]
  }
];

module.exports = {
  courseData,
  modulesData,
  chaptersData
};

