// Chapters 7 through 12: Advanced Classification, Clustering, Deep Learning, Outliers, and Frontiers
// 20 curriculum-aligned questions per chapter

const chaptersDataPart2 = [
  // ===================== CHAPTER 7 =====================
  {
    chapterNumber: 7,
    moduleNumber: 3,
    title: 'Classification: Advanced Methods',
    description: 'Ensemble techniques, Bagging, Random Forests, Boosting, AdaBoost, Gradient Boosting, Support Vector Machines, and ROC/AUC analysis.',
    overview: 'Advanced classification methods enhance predictive accuracy, stability, and expressiveness beyond standalone base classifiers. Ensemble paradigms combine diverse weak learners into powerful predictive engines through bootstrap aggregation (Bagging) and iterative adaptive weighting (Boosting). Furthermore, Support Vector Machines (SVM) establish maximum margin hyperplanes in high-dimensional transformed spaces using the kernel trick.',
    objectives: [
      'Analyze the theoretical foundation of ensemble diversity and compare Bagging and Boosting frameworks.',
      'Explain the construction of Random Forests via bootstrap aggregation and random feature subspace sampling.',
      'Formulate Support Vector Machines (SVM) as constrained quadratic optimization problems finding the maximum margin hyperplane.',
      'Construct and interpret Receiver Operating Characteristic (ROC) curves and Area Under the Curve (AUC) statistics.'
    ],
    content: `## 1. Ensemble Methods
Ensemble methods train multiple individual base models (classifiers) and combine their predictions via majority voting or weighted averaging to achieve superior predictive generalization.
- **Bagging (Bootstrap Aggregating)**:
  - Generates $B$ bootstrap samples (sampling with replacement) from training dataset $D$.
  - Trains an independent base learner on each sample.
  - Combines predictions via uniform voting.
  - *Primary effect*: Significantly reduces model **variance** without increasing bias.
- **Random Forests**:
  - Builds an ensemble of de-correlated decision trees.
  - At each node split, chooses the best split from a randomly selected subset of $m \\approx \\sqrt{d}$ features rather than evaluating all $d$ features.
- **Boosting**:
  - Iteratively trains base models in sequential succession.
  - Successive models focus heavily on instances misclassified by earlier models by adjusting sample weights.
  - Examples: **AdaBoost** (exponential loss re-weighting), **Gradient Boosting** (fitting trees to pseudo-residuals/negative gradient), **XGBoost**, **LightGBM**.

## 2. Support Vector Machines (SVM)
SVM finds the unique linear hyperplane that separates classes with the **maximum geometric margin**:
$$\\max_{\\mathbf{w}, b} \\frac{2}{\\|\\mathbf{w}\\|} \\quad \\text{subject to} \\quad y_i(\\mathbf{w} \\cdot \\mathbf{x}_i + b) \\ge 1, \\quad \\forall i$$
- **Support Vectors**: The critical training instances lying directly on the margin boundaries; removing non-support vectors leaves the decision boundary unchanged.
- **The Kernel Trick**: Implicitly maps input vectors into an infinite- or high-dimensional inner product space where non-linear patterns become linearly separable:
  - Linear Kernel: $K(\\mathbf{x}, \\mathbf{z}) = \\mathbf{x} \\cdot \\mathbf{z}$
  - Polynomial Kernel: $K(\\mathbf{x}, \\mathbf{z}) = (\\mathbf{x} \\cdot \\mathbf{z} + c)^d$
  - Radial Basis Function (RBF / Gaussian): $K(\\mathbf{x}, \\mathbf{z}) = \\exp(-\\gamma \\|\\mathbf{x} - \\mathbf{z}\\|^2)$

## 3. ROC Curves and AUC
- **ROC Curve**: Plots True Positive Rate (Sensitivity / Recall) on the y-axis against False Positive Rate ($1 - \\text{Specificity}$) on the x-axis across all decision probability thresholds.
- **AUC (Area Under the Curve)**: Ranges from 0.5 (random guess) to 1.0 (perfect discrimination). Represents the probability that a classifier ranks a randomly chosen positive sample higher than a randomly chosen negative sample.`,
    keyConcepts: 'Ensemble Learning, Bagging, Random Forest, Out-of-Bag (OOB) Error, Boosting, AdaBoost, Gradient Boosting, SVM, Maximum Margin, Support Vectors, Kernel Trick, ROC Curve, AUC.',
    slides: [
      { title: 'Advanced Classification Models', subtitle: 'Chapter 7: Ensembles & SVM', bullets: ['Why combinations of diverse weak learners outperform individual models', 'Bias-Variance decomposition in predictive learning', 'Non-linear separation via mathematical transformations'] },
      { title: 'Bagging vs Boosting', subtitle: 'Two Dominant Ensemble Paradigms', bullets: ['Bagging: Parallel independent models, reduces variance (Random Forest)', 'Boosting: Sequential adaptive models, reduces bias (AdaBoost, XGBoost)', 'Handling hard-to-classify edge instances'] },
      { title: 'Support Vector Machines', subtitle: 'Optimal Margin Classification', bullets: ['Hyperplane separating classes with maximal geometric margin', 'Support Vectors: The critical boundary points determining weights', 'The Kernel Trick: Projecting data into higher-dimensional feature space without explicit coordinate computation'] },
      { title: 'ROC and AUC Evaluation', subtitle: 'Threshold-Independent Performance', bullets: ['ROC Curve: True Positive Rate vs False Positive Rate', 'AUC: Aggregate ranking capability across all decision thresholds', 'Why AUC is invariant to class distribution skew'] }
    ],
    questions: [
      {
        questionNumber: 1,
        questionText: 'What is the primary mechanism by which Bagging (Bootstrap Aggregation) improves classification performance?',
        options: [
          { label: 'A', text: 'It trains independent models on bootstrap samples and averages them, substantially reducing prediction variance.', isCorrect: true },
          { label: 'B', text: 'It converts decision trees into neural networks.', isCorrect: false },
          { label: 'C', text: 'It forces all trees to have identical structures.', isCorrect: false },
          { label: 'D', text: 'It discards 90% of the training data.', isCorrect: false }
        ]
      },
      {
        questionNumber: 2,
        questionText: 'How does a Random Forest decorrelate individual decision trees compared to standard Bagging with full feature sets?',
        options: [
          { label: 'A', text: 'At each node split, it restricts the search to a randomly chosen subset of features (typically √d).', isCorrect: true },
          { label: 'B', text: 'It trains each tree on a completely different programming language.', isCorrect: false },
          { label: 'C', text: 'It prunes every tree down to a single root node.', isCorrect: false },
          { label: 'D', text: 'It forces all split thresholds to be zero.', isCorrect: false }
        ]
      },
      {
        questionNumber: 3,
        questionText: 'In the AdaBoost algorithm, how are training instance weights updated after each iterative boosting round?',
        options: [
          { label: 'A', text: 'Weights of incorrectly classified instances are increased, forcing subsequent learners to prioritize difficult cases.', isCorrect: true },
          { label: 'B', text: 'All weights are reset to zero.', isCorrect: false },
          { label: 'C', text: 'Correctly classified instances receive infinite weight.', isCorrect: false },
          { label: 'D', text: 'Instance weights are permuted at random.', isCorrect: false }
        ]
      },
      {
        questionNumber: 4,
        questionText: 'In Support Vector Machines (SVM), what are "Support Vectors"?',
        options: [
          { label: 'A', text: 'The specific training instances that lie closest to the decision boundary and define the margin hyperplane.', isCorrect: true },
          { label: 'B', text: 'The customer service staff maintaining the server', isCorrect: false },
          { label: 'C', text: 'Vectors containing only missing values', isCorrect: false },
          { label: 'D', text: 'Instances that were deleted during preprocessing', isCorrect: false }
        ]
      },
      {
        questionNumber: 5,
        questionText: 'What mathematical breakthrough does the "Kernel Trick" provide in Support Vector Machines?',
        options: [
          { label: 'A', text: 'It computes inner products in a high-dimensional feature space implicitly without ever calculating explicit coordinate mappings.', isCorrect: true },
          { label: 'B', text: 'It disables floating-point calculations to speed up the CPU.', isCorrect: false },
          { label: 'C', text: 'It converts non-relational databases into SQL tables.', isCorrect: false },
          { label: 'D', text: 'It forces decision boundaries to remain strictly parallel to coordinate axes.', isCorrect: false }
        ]
      },
      {
        questionNumber: 6,
        questionText: 'What does an Area Under the ROC Curve (AUC) value of 0.50 indicate?',
        options: [
          { label: 'A', text: 'Performance no better than random guessing', isCorrect: true },
          { label: 'B', text: 'Perfect discrimination with zero errors', isCorrect: false },
          { label: 'C', text: '50% of the training instances are corrupt', isCorrect: false },
          { label: 'D', text: 'A completely linear relationship', isCorrect: false }
        ]
      },
      {
        questionNumber: 7,
        questionText: 'What is plotted on the axes of a standard Receiver Operating Characteristic (ROC) curve?',
        options: [
          { label: 'A', text: 'True Positive Rate (y-axis) vs False Positive Rate (x-axis)', isCorrect: true },
          { label: 'B', text: 'Accuracy (y-axis) vs Training Time (x-axis)', isCorrect: false },
          { label: 'C', text: 'Precision (y-axis) vs Support (x-axis)', isCorrect: false },
          { label: 'D', text: 'Variance (y-axis) vs Bias (x-axis)', isCorrect: false }
        ]
      },
      {
        questionNumber: 8,
        questionText: 'In Gradient Boosting, what target do successive decision trees fit to in each sequential iteration?',
        options: [
          { label: 'A', text: 'The negative gradient (pseudo-residuals) of the loss function from previous trees', isCorrect: true },
          { label: 'B', text: 'Randomly generated numbers', isCorrect: false },
          { label: 'C', text: 'The original raw target labels unchanged', isCorrect: false },
          { label: 'D', text: 'The student test scores', isCorrect: false }
        ]
      },
      {
        questionNumber: 9,
        questionText: 'What is "Out-of-Bag (OOB) Error" in the context of Random Forests?',
        options: [
          { label: 'A', text: 'An internal validation estimate computed by evaluating each tree on the ~37% of training samples not included in its bootstrap sample.', isCorrect: true },
          { label: 'B', text: 'A physical packaging error in server delivery', isCorrect: false },
          { label: 'C', text: 'An unhandled buffer overflow in C++', isCorrect: false },
          { label: 'D', text: 'An error caused by insufficient disk storage', isCorrect: false }
        ]
      },
      {
        questionNumber: 10,
        questionText: 'Which kernel function in SVM is defined as K(x, z) = exp(-γ ||x - z||^2)?',
        options: [
          { label: 'A', text: 'Radial Basis Function (RBF / Gaussian) Kernel', isCorrect: true },
          { label: 'B', text: 'Linear Kernel', isCorrect: false },
          { label: 'C', text: 'Polynomial Kernel', isCorrect: false },
          { label: 'D', text: 'Sigmoid Kernel', isCorrect: false }
        ]
      },
      {
        questionNumber: 11,
        questionText: 'How does the soft-margin SVM parameter C govern the trade-off in optimization?',
        options: [
          { label: 'A', text: 'A large C heavily penalizes margin violations, aiming for a narrower margin with fewer training errors (lower bias, higher variance).', isCorrect: true },
          { label: 'B', text: 'C controls the screen brightness of the monitor.', isCorrect: false },
          { label: 'C', text: 'C has zero effect on the optimization objective.', isCorrect: false },
          { label: 'D', text: 'A large C sets all weights to zero.', isCorrect: false }
        ]
      },
      {
        questionNumber: 12,
        questionText: 'What strategy is used to adapt binary Support Vector Machines to multi-class classification problems with K classes by training K*(K-1)/2 pairwise classifiers?',
        options: [
          { label: 'A', text: 'One-vs-One (OvO)', isCorrect: true },
          { label: 'B', text: 'One-vs-Rest (OvR)', isCorrect: false },
          { label: 'C', text: 'Binary Cross-Entropy', isCorrect: false },
          { label: 'D', text: 'Linear Discriminant Analysis', isCorrect: false }
        ]
      },
      {
        questionNumber: 13,
        questionText: 'Why is feature scaling (e.g., Z-score standardization) critical prior to training Support Vector Machines with RBF kernels?',
        options: [
          { label: 'A', text: 'Because Euclidean distance calculations in the RBF kernel will be completely dominated by features with large numeric ranges.', isCorrect: true },
          { label: 'B', text: 'Because SVM cannot process negative numbers.', isCorrect: false },
          { label: 'C', text: 'Because unscaled features cause MySQL to shut down.', isCorrect: false },
          { label: 'D', text: 'Because kernels only accept inputs between 0 and 1.', isCorrect: false }
        ]
      },
      {
        questionNumber: 14,
        questionText: 'In Stacking (Stacked Generalization), how are predictions from multiple distinct base learners combined?',
        options: [
          { label: 'A', text: 'A meta-classifier (meta-learner) is trained using the base learners\' out-of-fold predictions as its input features.', isCorrect: true },
          { label: 'B', text: 'The model with the shortest name is automatically selected.', isCorrect: false },
          { label: 'C', text: 'All base models are deleted and replaced with a lookup table.', isCorrect: false },
          { label: 'D', text: 'Predictions are averaged using random numbers as weights.', isCorrect: false }
        ]
      },
      {
        questionNumber: 15,
        questionText: 'What is the theoretical interpretation of the AUC statistic in terms of ranking ability?',
        options: [
          { label: 'A', text: 'The probability that the classifier assigns a higher predicted score to a randomly chosen positive instance than to a randomly chosen negative instance.', isCorrect: true },
          { label: 'B', text: 'The exact percentage of training instances that were memorized.', isCorrect: false },
          { label: 'C', text: 'The correlation coefficient between the CPU and GPU.', isCorrect: false },
          { label: 'D', text: 'The ratio of false positives to total parameters.', isCorrect: false }
        ]
      },
      {
        questionNumber: 16,
        questionText: 'How does XGBoost (Extreme Gradient Boosting) enhance traditional gradient boosting implementations?',
        options: [
          { label: 'A', text: 'Through second-order Taylor expansion of the loss function, tree pruning, built-in L1/L2 regularization, and parallelized split finding.', isCorrect: true },
          { label: 'B', text: 'By removing all decision trees entirely.', isCorrect: false },
          { label: 'C', text: 'By converting all datasets into relational SQL strings.', isCorrect: false },
          { label: 'D', text: 'By only executing on mobile phones.', isCorrect: false }
        ]
      },
      {
        questionNumber: 17,
        questionText: 'What happens to the margin of an SVM when the regularization parameter C approaches zero?',
        options: [
          { label: 'A', text: 'The margin becomes wider, tolerating more misclassifications and margin violations (higher bias, lower variance).', isCorrect: true },
          { label: 'B', text: 'The margin becomes infinitely thin.', isCorrect: false },
          { label: 'C', text: 'The algorithm terminates with an exception.', isCorrect: false },
          { label: 'D', text: 'The model memorizes all noise.', isCorrect: false }
        ]
      },
      {
        questionNumber: 18,
        questionText: 'In an ROC curve, what point on the unit square corresponds to an ideal, flawless classifier?',
        options: [
          { label: 'A', text: '(FPR = 0, TPR = 1) at the top-left corner', isCorrect: true },
          { label: 'B', text: '(FPR = 1, TPR = 1) at the top-right corner', isCorrect: false },
          { label: 'C', text: '(FPR = 0, TPR = 0) at the bottom-left corner', isCorrect: false },
          { label: 'D', text: '(FPR = 0.5, TPR = 0.5) in the exact center', isCorrect: false }
        ]
      },
      {
        questionNumber: 19,
        questionText: 'Why are ensemble methods resilient against overfitting when individual base models are prone to variance?',
        options: [
          { label: 'A', text: 'Averaging uncorrelated errors from diverse models causes idiosyncratic variance to cancel out mathematically.', isCorrect: true },
          { label: 'B', text: 'Because ensemble models contain zero parameters.', isCorrect: false },
          { label: 'C', text: 'Because ensembles cannot process noisy data.', isCorrect: false },
          { label: 'D', text: 'Because all trees are identical copies.', isCorrect: false }
        ]
      },
      {
        questionNumber: 20,
        questionText: 'What is a major trade-off when adopting an ensemble of 500 deep gradient-boosted trees instead of a single shallow decision tree?',
        options: [
          { label: 'A', text: 'Substantially greater predictive accuracy at the expense of higher inference latency and loss of direct rule-based interpretability.', isCorrect: true },
          { label: 'B', text: 'Lower accuracy and higher interpretability.', isCorrect: false },
          { label: 'C', text: 'Zero memory usage during training.', isCorrect: false },
          { label: 'D', text: 'Complete inability to classify new records.', isCorrect: false }
        ]
      }
    ]
  },

  // ===================== CHAPTER 8 =====================
  {
    chapterNumber: 8,
    moduleNumber: 4,
    title: 'Cluster Analysis: Basic Concepts and Methods',
    description: 'Unsupervised learning, distance metrics, partitioning methods (k-Means, k-Medoids), and hierarchical clustering.',
    overview: 'Cluster analysis is the foundational unsupervised learning discipline of discovering natural, cohesive groupings within unlabeled datasets. Objects within a cluster exhibit high intra-cluster similarity, while objects belonging to different clusters exhibit high inter-cluster dissimilarity. This chapter explores distance metrics, the k-Means algorithm, k-Medoids (PAM), and agglomerative hierarchical clustering with dendrogram analysis.',
    objectives: [
      'Define unsupervised clustering and contrast it with supervised classification.',
      'Compute dissimilarity using Euclidean, Manhattan, Minkowski, and Cosine metrics.',
      'Execute the iterative k-Means clustering algorithm and analyze its convergence properties.',
      'Construct and interpret Agglomerative Hierarchical clustering dendrograms under various linkage criteria.'
    ],
    content: `## 1. What is Cluster Analysis?
Cluster analysis partitions an unlabeled dataset $D = \\{\\mathbf{x}_1, \\mathbf{x}_2, \\dots, \\mathbf{x}_n\\}$ into $k$ clusters such that:
- Intra-cluster similarity is maximized.
- Inter-cluster similarity is minimized.

## 2. Distance and Similarity Metrics
- **Euclidean Distance ($L_2$ Norm)**:
$$d(\\mathbf{x}, \\mathbf{y}) = \\sqrt{\\sum_{i=1}^d (x_i - y_i)^2}$$
- **Manhattan Distance ($L_1$ Norm / City Block)**:
$$d(\\mathbf{x}, \\mathbf{y}) = \\sum_{i=1}^d |x_i - y_i|$$
- **Cosine Similarity** (suitable for high-dimensional sparse text vectors):
$$\\text{Cosine}(\\mathbf{x}, \\mathbf{y}) = \\frac{\\mathbf{x} \\cdot \\mathbf{y}}{\\|\\mathbf{x}\\| \\|\\mathbf{y}\\|}$$

## 3. Partitioning Methods: k-Means
Given user-specified cluster count $k$:
1. Randomly initialize $k$ cluster centroids $\\{\\mathbf{c}_1, \\dots, \\mathbf{c}_k\\}$.
2. **Assignment Step**: Assign each data point $\\mathbf{x}_i$ to its nearest centroid.
3. **Update Step**: Recompute each centroid as the arithmetic mean of all points assigned to that cluster:
$$\\mathbf{c}_j = \\frac{1}{|C_j|} \\sum_{\\mathbf{x} \\in C_j} \\mathbf{x}$$
4. Repeat steps 2 and 3 until centroids stabilize (convergence) or max iterations reached.
- **Objective**: Minimizes Sum of Squared Errors (SSE): $\\text{SSE} = \\sum_{j=1}^k \\sum_{\\mathbf{x} \\in C_j} \\|\\mathbf{x} - \\mathbf{c}_j\\|^2$
- *Limitations*: Sensitive to initial centroid placement (mitigated by k-Means++), sensitive to outliers, assumes spherical clusters of equal size.
- **k-Medoids (PAM)**: Selects actual data objects as centers rather than means, making it far more robust to outliers.

## 4. Hierarchical Clustering
- **Agglomerative (Bottom-Up)**: Starts with each object in its own singleton cluster, iteratively merging the closest pair of clusters until all form a single cluster.
- **Divisive (Top-Down)**: Starts with all objects in one cluster, recursively splitting.
- **Linkage Criteria**:
  - *Single Linkage*: Minimum distance between any point in cluster A and any point in cluster B (prone to chaining effect).
  - *Complete Linkage*: Maximum distance between any point in A and any point in B (produces compact spherical clusters).
  - *Average Linkage*: Average distance between all pairs.
  - *Ward\'s Method*: Merges the pair of clusters that minimizes total within-cluster variance increase.`,
    keyConcepts: 'Unsupervised Learning, Intra-cluster Similarity, Euclidean Distance, Manhattan Distance, Cosine Similarity, k-Means, SSE, k-Medoids/PAM, Agglomerative Clustering, Dendrogram, Linkage Criteria, Ward\'s Method.',
    slides: [
      { title: 'Foundations of Cluster Analysis', subtitle: 'Chapter 8: Basic Clustering', bullets: ['Discovering natural groupings without ground-truth labels', 'Maximizing intra-cluster cohesion and inter-cluster separation', 'Applications: Customer segmentation, spatial GIS, anomaly baselines'] },
      { title: 'Distance & Proximity Metrics', subtitle: 'Geometry of Similarity', bullets: ['Euclidean (L2): Straight-line distance in Euclidean space', 'Manhattan (L1): Grid-constrained coordinate distance', 'Cosine Similarity: Angle-based metric for text/sparse vectors'] },
      { title: 'The k-Means Algorithm', subtitle: 'Partitioning Around Means', bullets: ['Initialize k cluster centroids', 'Assignment step: Allocate points to nearest centroid', 'Update step: Recalculate centroids as arithmetic means', 'SSE objective minimization and k-Means++ seeding'] },
      { title: 'Hierarchical Clustering & Dendrograms', subtitle: 'Nested Cluster Trees', bullets: ['Agglomerative bottom-up vs Divisive top-down', 'Visualizing hierarchies with dendrogram branch heights', 'Linkage methods: Single, Complete, Average, and Ward\'s variance'] }
    ],
    questions: [
      {
        questionNumber: 1,
        questionText: 'What is the primary mathematical objective minimized by the k-Means clustering algorithm?',
        options: [
          { label: 'A', text: 'Sum of Squared Errors (SSE) / Within-Cluster Sum of Squares', isCorrect: true },
          { label: 'B', text: 'The number of database connections', isCorrect: false },
          { label: 'C', text: 'The entropy of customer IDs', isCorrect: false },
          { label: 'D', text: 'The CPU clock frequency', isCorrect: false }
        ]
      },
      {
        questionNumber: 2,
        questionText: 'What is the Euclidean distance between points P1(1, 2) and P2(4, 6)?',
        options: [
          { label: 'A', text: '5.0 (√(3² + 4²))', isCorrect: true },
          { label: 'B', text: '7.0', isCorrect: false },
          { label: 'C', text: '25.0', isCorrect: false },
          { label: 'D', text: '1.0', isCorrect: false }
        ]
      },
      {
        questionNumber: 3,
        questionText: 'What is the Manhattan distance between points P1(1, 2) and P2(4, 6)?',
        options: [
          { label: 'A', text: '7 (|1 - 4| + |2 - 6|)', isCorrect: true },
          { label: 'B', text: '5', isCorrect: false },
          { label: 'C', text: '12', isCorrect: false },
          { label: 'D', text: '3', isCorrect: false }
        ]
      },
      {
        questionNumber: 4,
        questionText: 'Why is Cosine Similarity widely preferred over Euclidean distance when clustering high-dimensional document text vectors?',
        options: [
          { label: 'A', text: 'Cosine similarity measures angular orientation rather than vector magnitude, preventing document length from distorting topical similarity.', isCorrect: true },
          { label: 'B', text: 'Cosine similarity produces negative square roots.', isCorrect: false },
          { label: 'C', text: 'Euclidean distance cannot be calculated in computer RAM.', isCorrect: false },
          { label: 'D', text: 'Text documents can never be represented as vectors.', isCorrect: false }
        ]
      },
      {
        questionNumber: 5,
        questionText: 'How does k-Medoids (PAM - Partitioning Around Medoids) differ from standard k-Means?',
        options: [
          { label: 'A', text: 'k-Medoids chooses actual representative data points as cluster centers rather than arithmetic means, making it far more robust to outliers.', isCorrect: true },
          { label: 'B', text: 'k-Medoids only operates on circular data.', isCorrect: false },
          { label: 'C', text: 'k-Medoids requires labeled training data.', isCorrect: false },
          { label: 'D', text: 'k-Medoids cannot terminate.', isCorrect: false }
        ]
      },
      {
        questionNumber: 6,
        questionText: 'In hierarchical agglomerative clustering, what is a "Dendrogram"?',
        options: [
          { label: 'A', text: 'A tree diagram recording the hierarchical sequence of cluster merges and the dissimilarity levels at which each merge took place.', isCorrect: true },
          { label: 'B', text: 'A pie chart of disk space', isCorrect: false },
          { label: 'C', text: 'A hardware schematic for storage drives', isCorrect: false },
          { label: 'D', text: 'A database query plan diagram', isCorrect: false }
        ]
      },
      {
        questionNumber: 7,
        questionText: 'Which hierarchical linkage criterion defines the distance between two clusters as the MINIMUM distance between any single point in Cluster 1 and any single point in Cluster 2?',
        options: [
          { label: 'A', text: 'Single Linkage (nearest neighbor)', isCorrect: true },
          { label: 'B', text: 'Complete Linkage', isCorrect: false },
          { label: 'C', text: 'Average Linkage', isCorrect: false },
          { label: 'D', text: 'Centroid Linkage', isCorrect: false }
        ]
      },
      {
        questionNumber: 8,
        questionText: 'What is the "chaining effect" in hierarchical clustering, and which linkage method is notably susceptible to it?',
        options: [
          { label: 'A', text: 'The tendency for elongated clusters to merge prematurely through intermediate chain-like noise points; single linkage is susceptible.', isCorrect: true },
          { label: 'B', text: 'A blockchain encryption error; complete linkage is susceptible.', isCorrect: false },
          { label: 'C', text: 'The locking of database tables during k-Means.', isCorrect: false },
          { label: 'D', text: 'The creation of empty clusters in Ward\'s method.', isCorrect: false }
        ]
      },
      {
        questionNumber: 9,
        questionText: 'Which hierarchical linkage method defines distance as the MAXIMUM distance between any point in Cluster 1 and any point in Cluster 2, resulting in compact spherical clusters?',
        options: [
          { label: 'A', text: 'Complete Linkage (furthest neighbor)', isCorrect: true },
          { label: 'B', text: 'Single Linkage', isCorrect: false },
          { label: 'C', text: 'Median Linkage', isCorrect: false },
          { label: 'D', text: 'Random Linkage', isCorrect: false }
        ]
      },
      {
        questionNumber: 10,
        questionText: 'How does the k-Means++ initialization algorithm improve upon naive random centroid initialization?',
        options: [
          { label: 'A', text: 'It seeds initial centroids far apart from each other with probability proportional to their squared distance to the nearest existing centroid.', isCorrect: true },
          { label: 'B', text: 'It places all k centroids at coordinate (0, 0).', isCorrect: false },
          { label: 'C', text: 'It runs a neural network for 500 epochs first.', isCorrect: false },
          { label: 'D', text: 'It asks the user to manually click coordinates.', isCorrect: false }
        ]
      },
      {
        questionNumber: 11,
        questionText: 'What visual method is commonly used to estimate the optimal number of clusters k in k-Means by identifying the point where marginal SSE reduction sharply flattens?',
        options: [
          { label: 'A', text: 'The Elbow Method', isCorrect: true },
          { label: 'B', text: 'The Boxplot Rule', isCorrect: false },
          { label: 'C', text: 'The Fourier Transform', isCorrect: false },
          { label: 'D', text: 'The Pareto Chart', isCorrect: false }
        ]
      },
      {
        questionNumber: 12,
        questionText: 'What is a major limitation of the standard k-Means algorithm regarding cluster geometries?',
        options: [
          { label: 'A', text: 'It implicitly assumes convex, spherical clusters of roughly equal variance and size, struggling with non-convex or concentric shapes.', isCorrect: true },
          { label: 'B', text: 'It cannot cluster data in 2 dimensions.', isCorrect: false },
          { label: 'C', text: 'It requires labels for every point.', isCorrect: false },
          { label: 'D', text: 'It can only generate 1 cluster.', isCorrect: false }
        ]
      },
      {
        questionNumber: 13,
        questionText: 'In Ward\'s hierarchical clustering method, on what criterion are two clusters merged at each step?',
        options: [
          { label: 'A', text: 'Merging the pair that leads to the minimum increase in total within-cluster sum of squared errors', isCorrect: true },
          { label: 'B', text: 'Merging clusters that have the highest number of vowels', isCorrect: false },
          { label: 'C', text: 'Merging clusters with the highest maximum distance', isCorrect: false },
          { label: 'D', text: 'Merging clusters chosen uniformly at random', isCorrect: false }
        ]
      },
      {
        questionNumber: 14,
        questionText: 'What is the computational complexity of the naive Agglomerative Hierarchical clustering algorithm with N objects?',
        options: [
          { label: 'A', text: 'O(N^2) space and O(N^3) or O(N^2 log N) time', isCorrect: true },
          { label: 'B', text: 'O(1) constant time', isCorrect: false },
          { label: 'C', text: 'O(log N) time', isCorrect: false },
          { label: 'D', text: 'O(N!) time', isCorrect: false }
        ]
      },
      {
        questionNumber: 15,
        questionText: 'How is a final flat clustering obtained from an agglomerative hierarchical dendrogram?',
        options: [
          { label: 'A', text: 'By cutting the dendrogram horizontally at a chosen dissimilarity threshold', isCorrect: true },
          { label: 'B', text: 'By deleting all leaf nodes', isCorrect: false },
          { label: 'C', text: 'By reversing the tree root', isCorrect: false },
          { label: 'D', text: 'By calculating the arithmetic mean of all labels', isCorrect: false }
        ]
      },
      {
        questionNumber: 16,
        questionText: 'What happens to the k-Means algorithm when an outlier object is situated thousands of units away from all other data points?',
        options: [
          { label: 'A', text: 'The outlier substantially distorts the calculated centroid mean, pulling it away from the true dense data cluster.', isCorrect: true },
          { label: 'B', text: 'The algorithm automatically deletes the outlier.', isCorrect: false },
          { label: 'C', text: 'The outlier has zero effect on the centroid.', isCorrect: false },
          { label: 'D', text: 'The outlier causes SSE to become negative.', isCorrect: false }
        ]
      },
      {
        questionNumber: 17,
        questionText: 'Minkowski distance with parameter p = 1 corresponds to:',
        options: [
          { label: 'A', text: 'Manhattan distance', isCorrect: true },
          { label: 'B', text: 'Euclidean distance (p = 2)', isCorrect: false },
          { label: 'C', text: 'Chebyshev distance (p = ∞)', isCorrect: false },
          { label: 'D', text: 'Mahalanobis distance', isCorrect: false }
        ]
      },
      {
        questionNumber: 18,
        questionText: 'Can k-Means guarantee finding the global minimum of the SSE objective function?',
        options: [
          { label: 'A', text: 'No, k-Means is a heuristic algorithm that converges to a local minimum depending on initial centroid positions.', isCorrect: true },
          { label: 'B', text: 'Yes, it is mathematically proven to always locate the global optimum.', isCorrect: false },
          { label: 'C', text: 'Yes, provided the data has more than 10 rows.', isCorrect: false },
          { label: 'D', text: 'Only when running on 64-bit processors.', isCorrect: false }
        ]
      },
      {
        questionNumber: 19,
        questionText: 'What is a "fuzzy" (soft) clustering algorithm?',
        options: [
          { label: 'A', text: 'An algorithm where each data point has a degree of membership in multiple clusters between 0 and 1 (e.g., Fuzzy C-Means).', isCorrect: true },
          { label: 'B', text: 'An algorithm that prints blurry graphics', isCorrect: false },
          { label: 'C', text: 'An algorithm with broken source code', isCorrect: false },
          { label: 'D', text: 'An algorithm where clusters have no centroids', isCorrect: false }
        ]
      },
      {
        questionNumber: 20,
        questionText: 'Which preprocessing step is vital before executing k-Means on a dataset containing age (18-90) and annual salary ($20,000-$300,000)?',
        options: [
          { label: 'A', text: 'Feature normalization (e.g., Min-Max or Z-score) so salary does not completely dominate age in distance calculations.', isCorrect: true },
          { label: 'B', text: 'Converting salary into hexadecimal strings', isCorrect: false },
          { label: 'C', text: 'Removing all persons under age 50', isCorrect: false },
          { label: 'D', text: 'Multiplying age by 1,000', isCorrect: false }
        ]
      }
    ]
  },

  // ===================== CHAPTER 9 =====================
  {
    chapterNumber: 9,
    moduleNumber: 4,
    title: 'Cluster Analysis: Advanced Methods',
    description: 'Density-based clustering (DBSCAN, OPTICS), grid-based methods, and cluster evaluation metrics (Silhouette Coefficient).',
    overview: 'Partitioning and hierarchical algorithms struggle when clusters exhibit arbitrary complex shapes or significant noise. Density-based clustering algorithms discover clusters of arbitrary shapes by modeling clusters as dense continuous regions separated by regions of low density. This chapter covers DBSCAN, core and border point classifications, OPTICS reachability plots, and cluster validation using internal metrics like the Silhouette Coefficient.',
    objectives: [
      'Explain the density-based clustering paradigm and formalize DBSCAN parameters (Eps and MinPts).',
      'Classify data points into Core Points, Border Points, and Noise Points.',
      'Trace density-reachability and density-connectivity paths forming arbitrary cluster geometries.',
      'Compute and interpret the Silhouette Coefficient to validate cluster cohesion and separation.'
    ],
    content: `## 1. The DBSCAN Algorithm
DBSCAN (Density-Based Spatial Clustering of Applications with Noise) locates high-density regions separated by sparse noise:
- **Eps ($\\varepsilon$)**: Maximum radius of the neighborhood around point $p$.
- **MinPts**: Minimum number of points within the $\\varepsilon$-neighborhood of $p$ ($N_\\varepsilon(p)$) required to form a dense region.

### Point Classifications
1. **Core Point**: A point $p$ with $|N_\\varepsilon(p)| \\ge \\text{MinPts}$.
2. **Border Point**: A point $p$ with $|N_\\varepsilon(p)| < \\text{MinPts}$, but $p$ belongs to the $\\varepsilon$-neighborhood of a core point.
3. **Noise Point**: A point that is neither a core point nor a border point.

### Reachability Concepts
- **Directly Density-Reachable**: $q$ is directly density-reachable from $p$ if $p$ is a core point and $q \\in N_\\varepsilon(p)$.
- **Density-Reachable**: $q$ is density-reachable from $p$ if there exists a chain of core points $p_1, \\dots, p_n$ such that each $p_{i+1}$ is directly density-reachable from $p_i$.
- **Density-Connected**: $p$ and $q$ are density-connected if there exists an object $o$ such that both $p$ and $q$ are density-reachable from $o$.
- *A cluster is a maximal set of density-connected points.*

## 2. OPTICS (Ordering Points To Identify Clustering Structure)
Overcomes DBSCAN\'s difficulty in detecting clusters with varying local densities by producing an augmented ordering of points along with **core-distance** and **reachability-distance**, visualized as reachability plots where valleys represent clusters.

## 3. Cluster Validation: The Silhouette Coefficient
For an object $i$ in cluster $A$:
- $a(i)$: Average distance from $i$ to all other points in its own cluster $A$ (cohesion).
- $b(i)$: Minimum average distance from $i$ to points in any other cluster $C \\ne A$ (separation).
- **Silhouette Coefficient**:
$$s(i) = \\frac{b(i) - a(i)}{\\max(a(i), b(i))}$$
  - $s(i) \\approx +1$: Point is well matched to its own cluster and far from neighbors.
  - $s(i) \\approx 0$: Point lies on the border between two clusters.
  - $s(i) < 0$: Point is misassigned to the wrong cluster.`,
    keyConcepts: 'DBSCAN, Epsilon (Eps), MinPts, Core Point, Border Point, Noise Point, Density-Reachable, Density-Connected, OPTICS, Silhouette Coefficient, Davies-Bouldin Index.',
    slides: [
      { title: 'Density-Based Clustering', subtitle: 'Chapter 9: Advanced Clustering', bullets: ['Overcoming spherical cluster assumptions of k-Means', 'Discovering arbitrary concave shapes (crescents, rings)', 'Explicit isolation and rejection of noise/outliers'] },
      { title: 'DBSCAN Mechanics', subtitle: 'Core, Border, and Noise Points', bullets: ['Epsilon (Eps) radius and MinPts threshold', 'Core Point: Possesses >= MinPts within its Eps neighborhood', 'Border Point: Within neighborhood of a core point', 'Noise Point: Neither core nor border'] },
      { title: 'Reachability & Connectivity', subtitle: 'Cluster Expansion Chains', bullets: ['Directly density-reachable: In Eps of a core point', 'Density-reachable: Transitive chain of core points', 'Density-connected: Symmetric mutual origin connection'] },
      { title: 'Cluster Validation Metrics', subtitle: 'The Silhouette Coefficient', bullets: ['Cohesion a(i) vs Separation b(i)', 'Silhouette s(i) = [b(i) - a(i)] / max(a(i), b(i))', 'Global average Silhouette evaluates overall cluster quality'] }
    ],
    questions: [
      {
        questionNumber: 1,
        questionText: 'Under DBSCAN terminology, what defines a "Core Point"?',
        options: [
          { label: 'A', text: 'A point that contains at least MinPts points within its Epsilon (Eps) neighborhood.', isCorrect: true },
          { label: 'B', text: 'A point located at coordinate (0, 0)', isCorrect: false },
          { label: 'C', text: 'A point with zero neighbors', isCorrect: false },
          { label: 'D', text: 'A point chosen at random to be a centroid', isCorrect: false }
        ]
      },
      {
        questionNumber: 2,
        questionText: 'In DBSCAN, what defines a "Border Point"?',
        options: [
          { label: 'A', text: 'A point with fewer than MinPts neighbors, but situated within the Epsilon neighborhood of a core point.', isCorrect: true },
          { label: 'B', text: 'A point that lies on the boundary of the computer screen', isCorrect: false },
          { label: 'C', text: 'A point that has exactly 100 neighbors', isCorrect: false },
          { label: 'D', text: 'A point with negative distance to all centroids', isCorrect: false }
        ]
      },
      {
        questionNumber: 3,
        questionText: 'What is a "Noise Point" in DBSCAN?',
        options: [
          { label: 'A', text: 'Any point that is neither a core point nor a border point', isCorrect: true },
          { label: 'B', text: 'A point with an audio file attached', isCorrect: false },
          { label: 'C', text: 'The point with the lowest ID', isCorrect: false },
          { label: 'D', text: 'All points in cluster 1', isCorrect: false }
        ]
      },
      {
        questionNumber: 4,
        questionText: 'Why is DBSCAN uniquely superior to k-Means when clustering datasets with complex non-convex shapes (such as concentric circles or crescent spirals)?',
        options: [
          { label: 'A', text: 'DBSCAN grows clusters along density paths regardless of shape, whereas k-Means assumes convex spherical clusters around centroids.', isCorrect: true },
          { label: 'B', text: 'DBSCAN uses linear regression.', isCorrect: false },
          { label: 'C', text: 'DBSCAN forces all clusters to have identical radii.', isCorrect: false },
          { label: 'D', text: 'DBSCAN cannot process 2-dimensional data.', isCorrect: false }
        ]
      },
      {
        questionNumber: 5,
        questionText: 'Is the "directly density-reachable" relationship symmetric between any two points in DBSCAN?',
        options: [
          { label: 'A', text: 'No, because a border point can be directly density-reachable from a core point, but a core point is NOT directly density-reachable from a border point.', isCorrect: true },
          { label: 'B', text: 'Yes, it is always symmetric for all points.', isCorrect: false },
          { label: 'C', text: 'Yes, because distance is symmetric.', isCorrect: false },
          { label: 'D', text: 'Only when MinPts = 1.', isCorrect: false }
        ]
      },
      {
        questionNumber: 6,
        questionText: 'What is the theoretical range of the Silhouette Coefficient s(i) for an object i?',
        options: [
          { label: 'A', text: '-1.0 to +1.0', isCorrect: true },
          { label: 'B', text: '0 to 100', isCorrect: false },
          { label: 'C', text: '0 to infinity', isCorrect: false },
          { label: 'D', text: '-infinity to 0', isCorrect: false }
        ]
      },
      {
        questionNumber: 7,
        questionText: 'What does a Silhouette Coefficient close to +1.0 indicate for a data point?',
        options: [
          { label: 'A', text: 'The point is highly cohesive within its assigned cluster and well separated from neighboring clusters.', isCorrect: true },
          { label: 'B', text: 'The point was misclassified into the wrong cluster.', isCorrect: false },
          { label: 'C', text: 'The point lies directly on the decision boundary between clusters.', isCorrect: false },
          { label: 'D', text: 'The point is a duplicate entry.', isCorrect: false }
        ]
      },
      {
        questionNumber: 8,
        questionText: 'What does a negative Silhouette Coefficient (s(i) < 0) signify?',
        options: [
          { label: 'A', text: 'The point is on average closer to points in a neighboring cluster than to points in its own cluster, indicating a likely misassignment.', isCorrect: true },
          { label: 'B', text: 'The cluster has perfect density.', isCorrect: false },
          { label: 'C', text: 'The data point was removed during preprocessing.', isCorrect: false },
          { label: 'D', text: 'The calculation produced an imaginary number.', isCorrect: false }
        ]
      },
      {
        questionNumber: 9,
        questionText: 'What major challenge does the standard DBSCAN algorithm encounter when applied to datasets with varying local densities?',
        options: [
          { label: 'A', text: 'A single global Eps and MinPts parameter setting cannot simultaneously capture both sparse and dense clusters.', isCorrect: true },
          { label: 'B', text: 'It runs out of memory on integers.', isCorrect: false },
          { label: 'C', text: 'It requires continuous internet access.', isCorrect: false },
          { label: 'D', text: 'It deletes all border points.', isCorrect: false }
        ]
      },
      {
        questionNumber: 10,
        questionText: 'How does the OPTICS algorithm address DBSCAN\'s sensitivity to global density parameter settings?',
        options: [
          { label: 'A', text: 'By producing an augmented cluster-ordering of points along with reachability-distances, visualized as a valley-based reachability plot.', isCorrect: true },
          { label: 'B', text: 'By converting clustering into a decision tree', isCorrect: false },
          { label: 'C', text: 'By forcing k = 2 always', isCorrect: false },
          { label: 'D', text: 'By calculating PageRank on the data matrix', isCorrect: false }
        ]
      },
      {
        questionNumber: 11,
        questionText: 'What class of clustering algorithms quantizes the object space into a finite number of multi-resolution cells forming a grid structure (e.g., STING, CLIQUE)?',
        options: [
          { label: 'A', text: 'Grid-based clustering', isCorrect: true },
          { label: 'B', text: 'Partitioning clustering', isCorrect: false },
          { label: 'C', text: 'Model-based clustering', isCorrect: false },
          { label: 'D', text: 'Hierarchical agglomeration', isCorrect: false }
        ]
      },
      {
        questionNumber: 12,
        questionText: 'What is the primary advantage of grid-based clustering methods like STING?',
        options: [
          { label: 'A', text: 'Fast query processing time that is independent of the number of data objects, depending only on the number of grid cells.', isCorrect: true },
          { label: 'B', text: 'Zero memory consumption', isCorrect: false },
          { label: 'C', text: 'No need for coordinates', isCorrect: false },
          { label: 'D', text: 'Guaranteed 100% precision on classification', isCorrect: false }
        ]
      },
      {
        questionNumber: 13,
        questionText: 'In CLIQUE, how are subspace clusters discovered in high-dimensional datasets?',
        options: [
          { label: 'A', text: 'Using an Apriori-like property where a k-dimensional dense cell can only exist if its (k-1)-dimensional projections are also dense.', isCorrect: true },
          { label: 'B', text: 'By training 10,000 deep autoencoders', isCorrect: false },
          { label: 'C', text: 'By deleting all dimensions except the first two', isCorrect: false },
          { label: 'D', text: 'By sorting rows alphabetically', isCorrect: false }
        ]
      },
      {
        questionNumber: 14,
        questionText: 'What is the distinction between internal and external cluster validation metrics?',
        options: [
          { label: 'A', text: 'Internal metrics evaluate cluster structure using the data itself (e.g., Silhouette, SSE), whereas external metrics compare against external ground-truth class labels (e.g., Adjusted Rand Index).', isCorrect: true },
          { label: 'B', text: 'Internal metrics run inside the database; external metrics run in the browser.', isCorrect: false },
          { label: 'C', text: 'Internal metrics use Python; external metrics use Java.', isCorrect: false },
          { label: 'D', text: 'External metrics only evaluate disk read speed.', isCorrect: false }
        ]
      },
      {
        questionNumber: 15,
        questionText: 'What is the Davies-Bouldin Index?',
        options: [
          { label: 'A', text: 'An internal cluster evaluation metric where lower values indicate better clustering (high intra-cluster similarity and high between-cluster separation).', isCorrect: true },
          { label: 'B', text: 'A measurement of CPU temperature', isCorrect: false },
          { label: 'C', text: 'A supervised classification score', isCorrect: false },
          { label: 'D', text: 'An encryption hash standard', isCorrect: false }
        ]
      },
      {
        questionNumber: 16,
        questionText: 'In DBSCAN, what happens if Epsilon (Eps) is selected to be exceedingly large while MinPts is small?',
        options: [
          { label: 'A', text: 'Almost all data points merge into a single massive cluster, and virtually no noise is detected.', isCorrect: true },
          { label: 'B', text: 'Every point becomes its own singleton cluster.', isCorrect: false },
          { label: 'C', text: 'The program crashes with stack overflow.', isCorrect: false },
          { label: 'D', text: 'All points are labeled as noise.', isCorrect: false }
        ]
      },
      {
        questionNumber: 17,
        questionText: 'Conversely, what occurs if Epsilon is set exceedingly small in DBSCAN?',
        options: [
          { label: 'A', text: 'A large majority of data points are designated as noise, and valid clusters fail to form.', isCorrect: true },
          { label: 'B', text: 'All clusters merge together.', isCorrect: false },
          { label: 'C', text: 'The dataset expands by 200%.', isCorrect: false },
          { label: 'D', text: 'The algorithm converts into k-Means.', isCorrect: false }
        ]
      },
      {
        questionNumber: 18,
        questionText: 'What spatial indexing data structure is standardly leveraged to accelerate DBSCAN\'s Epsilon range queries from O(N^2) to O(N log N)?',
        options: [
          { label: 'A', text: 'k-d Tree or R* Tree', isCorrect: true },
          { label: 'B', text: 'Singly linked list', isCorrect: false },
          { label: 'C', text: 'Circular stack', isCorrect: false },
          { label: 'D', text: 'Min-heap of transaction IDs', isCorrect: false }
        ]
      },
      {
        questionNumber: 19,
        questionText: 'Can DBSCAN automatically determine the number of clusters without requiring the user to specify k in advance?',
        options: [
          { label: 'A', text: 'Yes, the number of clusters is dynamically discovered based on data density, Eps, and MinPts.', isCorrect: true },
          { label: 'B', text: 'No, DBSCAN requires user-defined k just like k-Means.', isCorrect: false },
          { label: 'C', text: 'Only when running on 1-dimensional numbers.', isCorrect: false },
          { label: 'D', text: 'No, DBSCAN always creates exactly 2 clusters.', isCorrect: false }
        ]
      },
      {
        questionNumber: 20,
        questionText: 'What is a "Density-Connected" pair of points in DBSCAN?',
        options: [
          { label: 'A', text: 'Two points p and q such that there exists a common object o from which both p and q are density-reachable.', isCorrect: true },
          { label: 'B', text: 'Two points with identical latitude coordinates', isCorrect: false },
          { label: 'C', text: 'Two points stored in consecutive memory addresses', isCorrect: false },
          { label: 'D', text: 'Points that have equal feature values in all dimensions', isCorrect: false }
        ]
      }
    ]
  },

  // ===================== CHAPTER 10 =====================
  {
    chapterNumber: 10,
    moduleNumber: 4,
    title: 'Deep Learning',
    description: 'Neural architectures, activation functions, loss functions, backpropagation, CNNs, RNNs, and regularization.',
    overview: 'Deep learning has revolutionized data mining by automating feature extraction from complex, high-dimensional, and unstructured data representations. Building from the artificial neuron (perceptron) to deep Multi-Layer Perceptrons (MLPs), this chapter investigates activation functions, cost functions, gradient descent optimization, backpropagation via the chain rule, Convolutional Neural Networks (CNNs) for spatial dependencies, Recurrent Neural Networks (RNN/LSTM) for sequences, and regularization strategies.',
    objectives: [
      'Formulate the computational model of an artificial neuron and multi-layer perceptron.',
      'Compare non-linear activation functions: Sigmoid, Tanh, ReLU, and Softmax.',
      'Derive and trace the backpropagation algorithm utilizing the multivariable chain rule.',
      'Analyze architectural components of CNNs (convolution, pooling) and RNNs/LSTMs (gates, cell states).'
    ],
    content: `## 1. From Perceptron to Deep Neural Networks
- **Artificial Neuron**: Computes weighted sum of inputs plus bias, passing result through activation function $\\sigma$:
$$z = \\mathbf{w}^T \\mathbf{x} + b, \\quad a = \\sigma(z)$$
- **Multi-Layer Perceptron (MLP)**: Input layer, one or more hidden layers, and an output layer.
- **Universal Approximation Theorem**: A feedforward neural network with a single hidden layer and non-linear activation function can approximate any continuous function on compact subsets of $\\mathbb{R}^n$ to arbitrary precision.

## 2. Activation Functions
- **Sigmoid**: $\\sigma(z) = \\frac{1}{1 + e^{-z}}$. Outputs in $(0, 1)$. Vanishing gradient problem for extreme $|z|$.
- **Tanh**: $\\tanh(z) = \\frac{e^z - e^{-z}}{e^z + e^{-z}}$. Zero-centered, range $(-1, +1)$.
- **ReLU (Rectified Linear Unit)**: $f(z) = \\max(0, z)$. Overcomes vanishing gradient for positive activations, computationally efficient.
- **Softmax**: Multi-class probability distribution over $K$ output classes:
$$P(y = k \\mid \\mathbf{x}) = \\frac{e^{z_k}}{\\sum_{j=1}^K e^{z_j}}$$

## 3. Training: Loss and Backpropagation
- **Loss Functions**: Mean Squared Error (regression), Binary Cross-Entropy, Categorical Cross-Entropy.
- **Backpropagation**: Computes the gradient of the loss function $\\mathcal{L}$ with respect to each weight $w_{ij}$ using the calculus chain rule:
$$\\frac{\\partial \\mathcal{L}}{\\partial w_{ij}} = \\frac{\\partial \\mathcal{L}}{\\partial a_j} \\cdot \\frac{\\partial a_j}{\\partial z_j} \\cdot \\frac{\\partial z_j}{\\partial w_{ij}}$$
- **Optimization**: Gradient Descent, Stochastic Gradient Descent (SGD), Adam (Adaptive Moment Estimation).

## 4. Specialized Deep Architectures
- **Convolutional Neural Networks (CNN)**: Uses convolutional kernels/filters and pooling layers (Max Pooling) to capture spatial hierarchies and translation invariance in image and grid data.
- **Recurrent Neural Networks (RNN) and LSTM**: Models sequential temporal data using recurrent hidden states. LSTM (Long Short-Term Memory) introduces input, forget, and output gates to solve vanishing gradients over long sequences.
- **Regularization**: Dropout (randomly deactivating units during training), Batch Normalization, and Early Stopping.`,
    keyConcepts: 'Perceptron, MLP, ReLU, Softmax, Cross-Entropy Loss, Gradient Descent, Backpropagation, Chain Rule, Vanishing Gradient, CNN, Pooling, RNN, LSTM, Dropout.',
    slides: [
      { title: 'Foundations of Deep Learning', subtitle: 'Chapter 10: Deep Architectures', bullets: ['From biological neurons to artificial neural networks', 'Feedforward propagation: Layer-wise affine transformations', 'Universal approximation theorem & representational depth'] },
      { title: 'Activation Functions & Non-Linearity', subtitle: 'Overcoming Vanishing Gradients', bullets: ['Sigmoid & Tanh: Historical foundations, saturation hazards', 'ReLU & Leaky ReLU: Fast computation and gradient propagation', 'Softmax: Normalized multi-class probability outputs'] },
      { title: 'Backpropagation & Optimization', subtitle: 'Training Deep Networks', bullets: ['Calculus multivariable chain rule for weight gradients', 'Gradient descent variants: Batch, Mini-batch, and Adam', 'Mitigating overfitting with Dropout and L2 weight decay'] },
      { title: 'Spatial & Temporal Architectures', subtitle: 'CNNs and LSTMs', bullets: ['CNN: Parameter sharing, convolutions, and pooling layers', 'RNN: Recurrent hidden states for temporal sequences', 'LSTM: Forget, input, and output gates for long-term memory'] }
    ],
    questions: [
      {
        questionNumber: 1,
        questionText: 'What mathematical role is served by the activation function in an artificial neural network?',
        options: [
          { label: 'A', text: 'It introduces non-linearity, enabling the network to learn complex non-linear functional mappings rather than collapsing into a single linear transformation.', isCorrect: true },
          { label: 'B', text: 'It turns the server power on and off.', isCorrect: false },
          { label: 'C', text: 'It prevents the computer from executing floating-point operations.', isCorrect: false },
          { label: 'D', text: 'It converts numbers into text strings.', isCorrect: false }
        ]
      },
      {
        questionNumber: 2,
        questionText: 'What is the primary operational advantage of the Rectified Linear Unit (ReLU) activation function f(z) = max(0, z) over the Sigmoid function?',
        options: [
          { label: 'A', text: 'It alleviates the vanishing gradient problem for positive inputs and is computationally fast to compute.', isCorrect: true },
          { label: 'B', text: 'It squashes outputs strictly between -1 and +1.', isCorrect: false },
          { label: 'C', text: 'It is a smooth cosine function.', isCorrect: false },
          { label: 'D', text: 'It requires zero training parameters.', isCorrect: false }
        ]
      },
      {
        questionNumber: 3,
        questionText: 'Which mathematical theorem establishes that the Backpropagation algorithm computes exact gradients by repeatedly applying the:',
        options: [
          { label: 'A', text: 'Chain rule of calculus', isCorrect: true },
          { label: 'B', text: 'Pythagorean theorem', isCorrect: false },
          { label: 'C', text: 'Binomial expansion theorem', isCorrect: false },
          { label: 'D', text: 'Heisenberg uncertainty principle', isCorrect: false }
        ]
      },
      {
        questionNumber: 4,
        questionText: 'Which output activation function produces a normalized probability distribution across K mutually exclusive classes such that all outputs sum to 1.0?',
        options: [
          { label: 'A', text: 'Softmax activation', isCorrect: true },
          { label: 'B', text: 'Linear activation', isCorrect: false },
          { label: 'C', text: 'Step activation', isCorrect: false },
          { label: 'D', text: 'Radial Basis Function', isCorrect: false }
        ]
      },
      {
        questionNumber: 5,
        questionText: 'What is the "Vanishing Gradient Problem" that historically impeded the training of very deep neural networks using Sigmoid or Tanh activations?',
        options: [
          { label: 'A', text: 'Gradients shrink exponentially as they propagate backward through multiple layers, causing early layer weights to learn extremely slowly or stall completely.', isCorrect: true },
          { label: 'B', text: 'The loss function becomes strictly equal to infinity.', isCorrect: false },
          { label: 'C', text: 'The computer runs out of physical hard drive space.', isCorrect: false },
          { label: 'D', text: 'All training labels disappear from the database.', isCorrect: false }
        ]
      },
      {
        questionNumber: 6,
        questionText: 'What regularization technique randomly deactivates a fraction of neurons (along with their connections) during each forward training pass?',
        options: [
          { label: 'A', text: 'Dropout', isCorrect: true },
          { label: 'B', text: 'Batch Normalization', isCorrect: false },
          { label: 'C', text: 'Max Pooling', isCorrect: false },
          { label: 'D', text: 'Min-Max Scaling', isCorrect: false }
        ]
      },
      {
        questionNumber: 7,
        questionText: 'Which layer type in a Convolutional Neural Network (CNN) reduces spatial feature map dimensions and achieves translation invariance by selecting the maximum value in local patches?',
        options: [
          { label: 'A', text: 'Max Pooling layer', isCorrect: true },
          { label: 'B', text: 'Fully Connected Dense layer', isCorrect: false },
          { label: 'C', text: 'Embedding layer', isCorrect: false },
          { label: 'D', text: 'Softmax layer', isCorrect: false }
        ]
      },
      {
        questionNumber: 8,
        questionText: 'What core capability makes Recurrent Neural Networks (RNNs) and LSTMs suitable for natural language processing and time-series mining?',
        options: [
          { label: 'A', text: 'Internal recurrent state memory that processes sequential dependencies over variable-length inputs.', isCorrect: true },
          { label: 'B', text: 'Their inability to accept more than 1 input value.', isCorrect: false },
          { label: 'C', text: 'They do not require backpropagation.', isCorrect: false },
          { label: 'D', text: 'They only execute on quantum computers.', isCorrect: false }
        ]
      },
      {
        questionNumber: 9,
        questionText: 'In a Long Short-Term Memory (LSTM) cell, which gate is specifically responsible for deciding what proportion of past cell state information should be discarded?',
        options: [
          { label: 'A', text: 'The Forget Gate', isCorrect: true },
          { label: 'B', text: 'The Input Gate', isCorrect: false },
          { label: 'C', text: 'The Output Gate', isCorrect: false },
          { label: 'D', text: 'The Softmax Gate', isCorrect: false }
        ]
      },
      {
        questionNumber: 10,
        questionText: 'Which loss function is the standard standard choice for training multi-class classification neural networks paired with Softmax outputs?',
        options: [
          { label: 'A', text: 'Categorical Cross-Entropy Loss', isCorrect: true },
          { label: 'B', text: 'Mean Absolute Percentage Error', isCorrect: false },
          { label: 'C', text: 'Hinge Loss', isCorrect: false },
          { label: 'D', text: 'Mean Squared Error', isCorrect: false }
        ]
      },
      {
        questionNumber: 11,
        questionText: 'What is the learning rate hyperparameter (α) in gradient descent optimization?',
        options: [
          { label: 'A', text: 'A scalar factor that determines the step size taken in the direction of the negative gradient at each parameter update.', isCorrect: true },
          { label: 'B', text: 'The total number of training epochs', isCorrect: false },
          { label: 'C', text: 'The number of hidden layers in the network', isCorrect: false },
          { label: 'D', text: 'The percentage of test data', isCorrect: false }
        ]
      },
      {
        questionNumber: 12,
        questionText: 'What happens during neural network training if the learning rate is set too large?',
        options: [
          { label: 'A', text: 'Optimization can oscillate wildly, overshoot the loss minima, and diverge.', isCorrect: true },
          { label: 'B', text: 'The network trains instantaneously with 100% accuracy.', isCorrect: false },
          { label: 'C', text: 'All weights freeze permanently at zero.', isCorrect: false },
          { label: 'D', text: 'The dataset is deleted.', isCorrect: false }
        ]
      },
      {
        questionNumber: 13,
        questionText: 'What distinguishes Stochastic Gradient Descent (SGD) from standard Batch Gradient Descent?',
        options: [
          { label: 'A', text: 'SGD updates model parameters using a single training sample (or small mini-batch) at each step, rather than waiting for the entire dataset.', isCorrect: true },
          { label: 'B', text: 'SGD never updates parameters.', isCorrect: false },
          { label: 'C', text: 'Batch Gradient Descent does not use gradients.', isCorrect: false },
          { label: 'D', text: 'SGD requires infinitely many epochs to start.', isCorrect: false }
        ]
      },
      {
        questionNumber: 14,
        questionText: 'What does "Early Stopping" do during deep neural network training?',
        options: [
          { label: 'A', text: 'Halts training when validation loss stops improving, preventing overfitting on the training set.', isCorrect: true },
          { label: 'B', text: 'Stops training after exactly 1 second', isCorrect: false },
          { label: 'C', text: 'Terminates the program if a user logs in', isCorrect: false },
          { label: 'D', text: 'Deletes the worst-performing 50% of weights', isCorrect: false }
        ]
      },
      {
        questionNumber: 15,
        questionText: 'What property does Batch Normalization introduce into deep networks?',
        options: [
          { label: 'A', text: 'Normalizes layer inputs across each mini-batch, stabilizing internal covariate shift and accelerating convergence.', isCorrect: true },
          { label: 'B', text: 'Converts all continuous variables into integer counts', isCorrect: false },
          { label: 'C', text: 'Enforces that all weights are positive numbers', isCorrect: false },
          { label: 'D', text: 'Restricts the network to a single output neuron', isCorrect: false }
        ]
      },
      {
        questionNumber: 16,
        questionText: 'What is a "Convolutional Kernel" (or filter) in a CNN?',
        options: [
          { label: 'A', text: 'A small spatial matrix of learnable weights that slides across the input to extract localized feature maps (e.g., edges, textures).', isCorrect: true },
          { label: 'B', text: 'The Linux kernel operating system process', isCorrect: false },
          { label: 'C', text: 'A database index on primary keys', isCorrect: false },
          { label: 'D', text: 'An encrypted token for secure logins', isCorrect: false }
        ]
      },
      {
        questionNumber: 17,
        questionText: 'What is the "Dying ReLU" problem in deep neural network training?',
        options: [
          { label: 'A', text: 'When a large gradient updates a ReLU neuron such that it outputs zero for all training inputs, resulting in zero gradients and permanent inactivity.', isCorrect: true },
          { label: 'B', text: 'When a neuron overheats the CPU motherboard', isCorrect: false },
          { label: 'C', text: 'When a neuron produces infinite output', isCorrect: false },
          { label: 'D', text: 'When the operating system runs out of swap memory', isCorrect: false }
        ]
      },
      {
        questionNumber: 18,
        questionText: 'How does Leaky ReLU modify standard ReLU to combat the Dying ReLU issue?',
        options: [
          { label: 'A', text: 'It assigns a small non-zero slope (e.g., 0.01z) to negative inputs rather than setting them strictly to zero.', isCorrect: true },
          { label: 'B', text: 'It multiplies all positive inputs by negative 1.', isCorrect: false },
          { label: 'C', text: 'It rounds all values to the nearest integer.', isCorrect: false },
          { label: 'D', text: 'It replaces all neurons with decision trees.', isCorrect: false }
        ]
      },
      {
        questionNumber: 19,
        questionText: 'What is Transfer Learning in modern deep learning practice?',
        options: [
          { label: 'A', text: 'Leveraging a deep model pre-trained on a massive dataset (e.g., ImageNet) and fine-tuning its weights on a smaller domain-specific task.', isCorrect: true },
          { label: 'B', text: 'Copying a database backup to a flash drive', isCorrect: false },
          { label: 'C', text: 'Translating code from Python into C++', isCorrect: false },
          { label: 'D', text: 'Transferring user account ownership to another student', isCorrect: false }
        ]
      },
      {
        questionNumber: 20,
        questionText: 'What key innovation did the Transformer architecture introduce to replace recurrent sequential processing in sequence modeling?',
        options: [
          { label: 'A', text: 'Self-Attention mechanisms that compute relationships between all tokens in parallel without recurrence.', isCorrect: true },
          { label: 'B', text: 'Manual rule-based regular expressions', isCorrect: false },
          { label: 'C', text: 'Removing all hidden layers', isCorrect: false },
          { label: 'D', text: 'Replacing floating-point numbers with roman numerals', isCorrect: false }
        ]
      }
    ]
  },

  // ===================== CHAPTER 11 =====================
  {
    chapterNumber: 11,
    moduleNumber: 4,
    title: 'Outlier Detection',
    description: 'Anomaly detection taxonomy, statistical approaches, proximity-based methods, density-based LOF, and Isolation Forests.',
    overview: 'Outliers (anomalies) are data objects that deviate significantly from the general distribution of remaining data, raising suspicion that they were generated by a distinct mechanism. Critical for fraud detection, network intrusion detection, system health diagnostics, and medical monitoring, outlier detection encompasses statistical tests, distance and proximity models, Local Outlier Factor (LOF), and ensemble Isolation Forests.',
    objectives: [
      'Classify outliers into Global, Contextual, and Collective anomaly categories.',
      'Apply statistical tests (Z-score, Grubbs\' test) and evaluate parametric assumptions.',
      'Compute and interpret the Local Outlier Factor (LOF) using local reachability density.',
      'Explain the Isolation Forest algorithm and its tree-depth anomaly scoring mechanism.'
    ],
    content: `## 1. What is an Outlier?
Hawkins (1980) defined an outlier as: *"An observation which deviates so much from other observations as to arouse suspicions that it was generated by a different mechanism."*

### Types of Outliers
1. **Global Outliers (Point Anomalies)**: A single object that deviates significantly from all other data points in the entire dataset (e.g., a credit transaction of $1,000,000 when normal transactions are < $100).
2. **Contextual Outliers (Conditional Anomalies)**: An object that deviates significantly within a specific context, but may appear normal in another context (e.g., temperature of 32°F in July in Phoenix vs. January in Montreal).
3. **Collective Outliers**: A subset of data objects that collectively deviate from the entire dataset, even though individual objects in isolation may not appear anomalous (e.g., a sequence of server requests indicating a DDoS attack).

## 2. Detection Paradigms
- **Supervised**: High class imbalance, requires ground-truth labels.
- **Semi-Supervised (Novelty Detection)**: Model is trained exclusively on normal instances; any instance deviating from normal distribution is flagged.
- **Unsupervised**: Discovers anomalies with no prior labels by assuming normal instances far outnumber anomalies.

## 3. Methodologies
- **Statistical Methods**:
  - Parametric (Gaussian z-score $> 3.0$, Grubbs\' test).
  - Non-parametric (Boxplot $1.5 \\times \\text{IQR}$).
- **Proximity-Based (Distance-to-kth-Nearest-Neighbor)**: Points situated far from their $k$-NN neighbors are flagged as outliers.
- **Density-Based: Local Outlier Factor (LOF)**:
  - Compares the **local reachability density** of an object $p$ to that of its $k$-nearest neighbors.
  - $\\text{LOF} \\approx 1$: Object has density comparable to its neighbors (normal).
  - $\\text{LOF} > 1$: Object has lower density than neighbors (local outlier).
  - Handles datasets with varying cluster densities that trip distance-based methods.
- **Isolation Forest (iForest)**:
  - Anomalies are "few and different", making them susceptible to rapid isolation.
  - Recursively splits features randomly; outliers are isolated close to the root with **short average path lengths** in isolation trees.`,
    keyConcepts: 'Global Outlier, Contextual Outlier, Collective Outlier, Novelty Detection, Z-Score, Grubbs\' Test, k-NN Distance, Local Outlier Factor (LOF), Local Reachability Density, Isolation Forest, Path Length.',
    slides: [
      { title: 'The Anatomy of Anomalies', subtitle: 'Chapter 11: Outlier Detection', bullets: ['Observations generated by an abnormal underlying mechanism', 'Fraud, cyber intrusion, hardware faults, rare medical conditions', 'Differentiating anomalies from measurement noise'] },
      { title: 'Three Classes of Outliers', subtitle: 'Taxonomy of Anomalies', bullets: ['Global: Deviates significantly from the entire dataset', 'Contextual: Anomalous only within contextual attributes (time, location)', 'Collective: Coordinated group pattern anomalous as a sequence'] },
      { title: 'Local Outlier Factor (LOF)', subtitle: 'Density-Based Outlier Detection', bullets: ['Overcomes limitations of global distance metrics', 'Local reachability density relative to k-nearest neighbors', 'LOF >> 1 identifies local outliers in sparse/dense fields'] },
      { title: 'The Isolation Forest', subtitle: 'Tree-Based Anomaly Partitioning', bullets: ['Anomalies are few and different: Easy to isolate', 'Random axis-aligned recursive recursive splits', 'Short tree path length = High anomaly score'] }
    ],
    questions: [
      {
        questionNumber: 1,
        questionText: 'A financial transaction of $500,000 on a credit card whose typical transactions range between $10 and $80 represents which type of outlier?',
        options: [
          { label: 'A', text: 'Global Outlier (Point Anomaly)', isCorrect: true },
          { label: 'B', text: 'Contextual Outlier only', isCorrect: false },
          { label: 'C', text: 'Collective Outlier', isCorrect: false },
          { label: 'D', text: 'A completely normal transaction', isCorrect: false }
        ]
      },
      {
        questionNumber: 2,
        questionText: 'A temperature reading of -5°C recorded in the Sahara desert during noon in July is best categorized as a:',
        options: [
          { label: 'A', text: 'Contextual (Conditional) Outlier', isCorrect: true },
          { label: 'B', text: 'Global Outlier', isCorrect: false },
          { label: 'C', text: 'Supervised Label', isCorrect: false },
          { label: 'D', text: 'Centroid', isCorrect: false }
        ]
      },
      {
        questionNumber: 3,
        questionText: 'A sequence of web requests that individually look like normal HTTP GET queries, but together exhibit the signature of a Denial-of-Service attack, represents:',
        options: [
          { label: 'A', text: 'A Collective Outlier', isCorrect: true },
          { label: 'B', text: 'A Global Outlier', isCorrect: false },
          { label: 'C', text: 'A Contextual Outlier', isCorrect: false },
          { label: 'D', text: 'A regression fit', isCorrect: false }
        ]
      },
      {
        questionNumber: 4,
        questionText: 'Under the standard Gaussian assumption, an observation is conventionally flagged as a potential statistical outlier if its absolute Z-score satisfies:',
        options: [
          { label: 'A', text: '|Z| > 3.0', isCorrect: true },
          { label: 'B', text: '|Z| > 0.1', isCorrect: false },
          { label: 'C', text: '|Z| = 0.0', isCorrect: false },
          { label: 'D', text: '|Z| < 1.0', isCorrect: false }
        ]
      },
      {
        questionNumber: 5,
        questionText: 'What fundamental premise allows the Local Outlier Factor (LOF) algorithm to detect anomalies in datasets with varying local cluster densities?',
        options: [
          { label: 'A', text: 'It measures the local reachability density of an object relative to the average local reachability densities of its k-nearest neighbors.', isCorrect: true },
          { label: 'B', text: 'It assumes all clusters have identical uniform density.', isCorrect: false },
          { label: 'C', text: 'It deletes all clusters with more than 5 points.', isCorrect: false },
          { label: 'D', text: 'It computes distance to the global dataset origin only.', isCorrect: false }
        ]
      },
      {
        questionNumber: 6,
        questionText: 'An object p evaluated by the LOF algorithm produces an LOF score of approximately 1.0. What does this score indicate?',
        options: [
          { label: 'A', text: 'The object is normal, possessing a density comparable to that of its neighbors.', isCorrect: true },
          { label: 'B', text: 'The object is an extreme outlier.', isCorrect: false },
          { label: 'C', text: 'The object has missing attribute values.', isCorrect: false },
          { label: 'D', text: 'The object is the exact dataset mean.', isCorrect: false }
        ]
      },
      {
        questionNumber: 7,
        questionText: 'If an object p yields an LOF score of 5.8, what can be deduced about p?',
        options: [
          { label: 'A', text: 'It is a strong local outlier, having significantly lower density than its neighboring points.', isCorrect: true },
          { label: 'B', text: 'It is located in the most densely populated cluster in the dataset.', isCorrect: false },
          { label: 'C', text: 'Its calculation was corrupted.', isCorrect: false },
          { label: 'D', text: 'It is identical to all other points.', isCorrect: false }
        ]
      },
      {
        questionNumber: 8,
        questionText: 'What core theoretical insight underpins the Isolation Forest (iForest) anomaly detection algorithm?',
        options: [
          { label: 'A', text: 'Anomalies are few and different; therefore, random recursive partitioning isolates anomalies with substantially shorter path lengths than normal points.', isCorrect: true },
          { label: 'B', text: 'Anomalies always cluster together into the largest leaf nodes.', isCorrect: false },
          { label: 'C', text: 'Anomalies can only be detected using deep neural networks.', isCorrect: false },
          { label: 'D', text: 'Normal points are always located at the root of the tree.', isCorrect: false }
        ]
      },
      {
        questionNumber: 9,
        questionText: 'In an Isolation Tree, if sample A has an average path length of 3 splits while sample B has an average path length of 18 splits, which sample is more anomalous?',
        options: [
          { label: 'A', text: 'Sample A, because it was rapidly isolated near the root of the trees.', isCorrect: true },
          { label: 'B', text: 'Sample B, because deeper paths mean higher error.', isCorrect: false },
          { label: 'C', text: 'Both samples are equally normal.', isCorrect: false },
          { label: 'D', text: 'Neither sample can be scored.', isCorrect: false }
        ]
      },
      {
        questionNumber: 10,
        questionText: 'What is "Novelty Detection" (Semi-Supervised Anomaly Detection)?',
        options: [
          { label: 'A', text: 'Training an anomaly detector solely on verified clean, normal instances so that any subsequent deviation during inference is flagged as an anomaly.', isCorrect: true },
          { label: 'B', text: 'Reading a novel during training', isCorrect: false },
          { label: 'C', text: 'Generating synthetic data exclusively', isCorrect: false },
          { label: 'D', text: 'Classifying images into 1,000 categories', isCorrect: false }
        ]
      },
      {
        questionNumber: 11,
        questionText: 'Which statistical test is explicitly designed to detect a single outlier in a univariate dataset following an approximately normal distribution?',
        options: [
          { label: 'A', text: 'Grubbs\' Test', isCorrect: true },
          { label: 'B', text: 'Turing Test', isCorrect: false },
          { label: 'C', text: 'A/B Test', isCorrect: false },
          { label: 'D', text: 'Chi-Square Test', isCorrect: false }
        ]
      },
      {
        questionNumber: 12,
        questionText: 'Why can proximity-based (distance-to-kth-nearest-neighbor) outlier detection methods become prohibitively expensive on big datasets?',
        options: [
          { label: 'A', text: 'Naive all-pairs distance calculations require O(N^2) pairwise comparisons.', isCorrect: true },
          { label: 'B', text: 'Because distance metrics require internet connectivity.', isCorrect: false },
          { label: 'C', text: 'Because nearest neighbors cannot be computed in parallel.', isCorrect: false },
          { label: 'D', text: 'Because the algorithm deletes the database after each run.', isCorrect: false }
        ]
      },
      {
        questionNumber: 13,
        questionText: 'What is the Mahalanobis Distance, and why is it valuable in multivariate outlier detection?',
        options: [
          { label: 'A', text: 'It measures the distance of a point from a distribution centroid while accounting for the covariance and correlations between attributes.', isCorrect: true },
          { label: 'B', text: 'It measures the distance between two web servers.', isCorrect: false },
          { label: 'C', text: 'It is a distance metric that ignores all variances.', isCorrect: false },
          { label: 'D', text: 'It only works on 1-dimensional data.', isCorrect: false }
        ]
      },
      {
        questionNumber: 14,
        questionText: 'How can an Autoencoder neural network be deployed for unsupervised anomaly detection?',
        options: [
          { label: 'A', text: 'Trained to reconstruct normal patterns; instances with high reconstruction error during test time are flagged as anomalies.', isCorrect: true },
          { label: 'B', text: 'By predicting future stock prices directly', isCorrect: false },
          { label: 'C', text: 'By setting its learning rate to zero', isCorrect: false },
          { label: 'D', text: 'By using only one input neuron', isCorrect: false }
        ]
      },
      {
        questionNumber: 15,
        questionText: 'What is "Masking" in the context of outlier detection?',
        options: [
          { label: 'A', text: 'When the presence of multiple outliers close to each other hides their anomalous nature from distance- or statistics-based detection.', isCorrect: true },
          { label: 'B', text: 'Hiding passwords on screen with asterisks', isCorrect: false },
          { label: 'C', text: 'Applying image filters to faces', isCorrect: false },
          { label: 'D', text: 'Bitwise AND operations in assembly', isCorrect: false }
        ]
      },
      {
        questionNumber: 16,
        questionText: 'What is "Swamping" in statistical outlier detection?',
        options: [
          { label: 'A', text: 'When normal observations are incorrectly flagged as outliers because an extreme outlier heavily inflated the sample variance and mean.', isCorrect: true },
          { label: 'B', text: 'Flooding the server with network packets', isCorrect: false },
          { label: 'C', text: 'Filling memory with zero bytes', isCorrect: false },
          { label: 'D', text: 'Overfitting a decision tree', isCorrect: false }
        ]
      },
      {
        questionNumber: 17,
        questionText: 'In One-Class Support Vector Machines (OC-SVM), how are anomalies identified?',
        options: [
          { label: 'A', text: 'The algorithm learns a boundary enclosing normal training points in kernel space; points falling outside the boundary are designated anomalies.', isCorrect: true },
          { label: 'B', text: 'By training on equal numbers of positive and negative labels', isCorrect: false },
          { label: 'C', text: 'By maximizing entropy across all classes', isCorrect: false },
          { label: 'D', text: 'By running linear regression on time', isCorrect: false }
        ]
      },
      {
        questionNumber: 18,
        questionText: 'Why is linear PCA effective as a dimension-reduction anomaly detector?',
        options: [
          { label: 'A', text: 'Anomalies that violate attribute correlation structures produce large projection errors onto lower-ranked principal components.', isCorrect: true },
          { label: 'B', text: 'PCA eliminates all numbers smaller than 10.', isCorrect: false },
          { label: 'C', text: 'PCA only projects outliers.', isCorrect: false },
          { label: 'D', text: 'PCA is a supervised classification model.', isCorrect: false }
        ]
      },
      {
        questionNumber: 19,
        questionText: 'How can clustering algorithms (such as DBSCAN or k-Means) be adapted for outlier detection?',
        options: [
          { label: 'A', text: 'DBSCAN natively isolates noise points, while in k-Means, points exhibiting very high distance to their nearest centroid can be flagged.', isCorrect: true },
          { label: 'B', text: 'By assuming the largest cluster is 100% outliers', isCorrect: false },
          { label: 'C', text: 'By setting k = 0', isCorrect: false },
          { label: 'D', text: 'Clustering algorithms cannot identify outliers under any circumstance.', isCorrect: false }
        ]
      },
      {
        questionNumber: 20,
        questionText: 'In time-series sensor monitoring, what distinguishes contextual attributes from behavioral attributes?',
        options: [
          { label: 'A', text: 'Contextual attributes define the circumstances (e.g., timestamp, ambient weather), while behavioral attributes measure the actual values (e.g., turbine temperature, voltage).', isCorrect: true },
          { label: 'B', text: 'Contextual attributes are always corrupted.', isCorrect: false },
          { label: 'C', text: 'Behavioral attributes are only text labels.', isCorrect: false },
          { label: 'D', text: 'They are identical and interchangeable.', isCorrect: false }
        ]
      }
    ]
  },

  // ===================== CHAPTER 12 =====================
  {
    chapterNumber: 12,
    moduleNumber: 4,
    title: 'Data Mining Trends and Research Frontiers',
    description: 'Big data streams, graph mining, spatiotemporal mining, privacy-preserving data mining, and explainable AI (XAI).',
    overview: 'As computing systems evolve, data mining faces dynamic frontiers characterized by unprecedented velocity, complex graph structures, spatio-temporal dynamics, stringent privacy mandates, and demands for algorithmic transparency. This concluding chapter investigates streaming analytics and concept drift, graph mining (PageRank, community detection), Privacy-Preserving Data Mining (k-anonymity, differential privacy), and Explainable Artificial Intelligence (XAI: SHAP, LIME).',
    objectives: [
      'Analyze data stream characteristics, sliding window models, and concept drift adaptation.',
      'Explain fundamental graph mining methods: PageRank, random walks, and community detection.',
      'Formulate Privacy-Preserving Data Mining paradigms: k-Anonymity, l-Diversity, and Differential Privacy.',
      'Apply Explainable AI (XAI) frameworks (SHAP, LIME) to interpret opaque complex models.'
    ],
    content: `## 1. Mining Big Data Streams
Data streams arrive continuously, ordered, fast, and unbounded:
- **Streaming Constraints**: Single-pass processing, limited memory footprint, real-time response.
- **Sliding Window Model**: Considers only the most recent $W$ tuples.
- **Concept Drift**: Statistical properties of the target variable change over time:
  - *Sudden Drift*: Abrupt shift (e.g., global pandemic onset).
  - *Gradual Drift*: Incremental evolution (e.g., customer taste shifts).
  - *Detection*: Drift Detection Method (DDM), Adaptive Windowing (ADWIN).

## 2. Graph and Network Mining
- **PageRank**: Computes link-based structural prestige using random surfer models:
$$PR(u) = \\frac{1 - d}{N} + d \\sum_{v \\in B_u} \\frac{PR(v)}{L(v)}$$
where $d \\approx 0.85$ is the damping factor.
- **Community Detection**: Graph partitioning to discover densely connected subgraphs with sparse inter-community links (e.g., Louvain modularity optimization).

## 3. Privacy-Preserving Data Mining (PPDM)
- **k-Anonymity**: Each released record cannot be distinguished from at least $k-1$ other individuals regarding quasi-identifiers.
- **l-Diversity**: Requires at least $l$ "well-represented" sensitive values within each equivalence class (combats homogeneity attacks).
- **t-Closeness**: Enforces that the distribution of a sensitive attribute within any equivalence class is close to the global distribution within distance $t$.
- **Differential Privacy ($\epsilon$-DP)**:
$$\\Pr[\\mathcal{M}(D) \\in S] \\le e^{\\epsilon} \\Pr[\\mathcal{M}(D') \\in S]$$
Guarantees that an observer cannot reliably ascertain whether any specific individual participated in database $D$, regardless of external auxiliary knowledge.

## 4. Explainable AI (XAI)
- **LIME (Local Interpretable Model-agnostic Explanations)**: Fits an interpretable surrogate model (e.g., sparse linear regression) locally around a specific prediction.
- **SHAP (SHapley Additive exPlanations)**: Founded upon cooperative game theory (Shapley values). Fairly attributes the marginal contribution of each feature to the difference between actual prediction and expected baseline.`,
    keyConcepts: 'Data Stream Mining, Concept Drift, ADWIN, PageRank, Random Walk, Community Detection, Modularity, k-Anonymity, l-Diversity, Differential Privacy, Epsilon (ε), Explainable AI (XAI), SHAP, LIME.',
    slides: [
      { title: 'Frontiers of Data Mining', subtitle: 'Chapter 12: Emerging Trends & Research', bullets: ['From static databases to unbounded continuous streams', 'Graph, network, and spatio-temporal intelligence', 'Privacy governance, algorithmic transparency, and ethical AI'] },
      { title: 'Streaming Data & Concept Drift', subtitle: 'Real-Time Dynamic Analytics', bullets: ['Sliding window and decay models under strict memory limits', 'Concept drift: Sudden, gradual, and recurring shifts', 'Adaptive algorithms: ADWIN and online ensemble learners'] },
      { title: 'Privacy-Preserving Mining (PPDM)', subtitle: 'Data Utility vs Individual Confidentiality', bullets: ['k-Anonymity, l-Diversity, and t-Closeness limitations', 'Differential Privacy (ε-DP): Provable mathematical privacy bounds', 'Adding calibrated Laplace/Gaussian noise to query answers'] },
      { title: 'Explainable AI (XAI)', subtitle: 'Opening the Algorithmic Black Box', bullets: ['Why production systems require post-hoc interpretability', 'LIME: Local surrogate linear approximations', 'SHAP: Cooperative game-theoretic Shapley feature attribution'] }
    ],
    questions: [
      {
        questionNumber: 1,
        questionText: 'What computational constraint uniquely characterizes data stream mining compared to traditional database mining?',
        options: [
          { label: 'A', text: 'Data arrives continuously at high velocity and must be processed in a single pass under strict memory bounds.', isCorrect: true },
          { label: 'B', text: 'Data streams can only contain prime numbers.', isCorrect: false },
          { label: 'C', text: 'All stream data must be stored on magnetic tapes first.', isCorrect: false },
          { label: 'D', text: 'Data streams cannot be analyzed using mathematical operations.', isCorrect: false }
        ]
      },
      {
        questionNumber: 2,
        questionText: 'What is "Concept Drift" in continuous data mining applications?',
        options: [
          { label: 'A', text: 'The statistical properties of the target concept change over time, degrading model accuracy if unadapted.', isCorrect: true },
          { label: 'B', text: 'A computer virus that renames database tables', isCorrect: false },
          { label: 'C', text: 'Moving servers to a different geographic datacenter', isCorrect: false },
          { label: 'D', text: 'When a database engine runs out of primary keys', isCorrect: false }
        ]
      },
      {
        questionNumber: 3,
        questionText: 'In Google\'s foundational PageRank algorithm, what is the role of the damping factor d (typically set around 0.85)?',
        options: [
          { label: 'A', text: 'The probability that a random web surfer continues clicking forward hyperlinks rather than jumping to a random new webpage.', isCorrect: true },
          { label: 'B', text: 'The percentage of web pages that are blocked by firewalls', isCorrect: false },
          { label: 'C', text: 'The CPU cache hit ratio', isCorrect: false },
          { label: 'D', text: 'The database transaction isolation level', isCorrect: false }
        ]
      },
      {
        questionNumber: 4,
        questionText: 'In Privacy-Preserving Data Mining, a sanitized dataset satisfies "k-Anonymity" if:',
        options: [
          { label: 'A', text: 'Each record cannot be distinguished from at least (k - 1) other individuals with respect to quasi-identifiers.', isCorrect: true },
          { label: 'B', text: 'The dataset has exactly k columns.', isCorrect: false },
          { label: 'C', text: 'All passwords have at least k characters.', isCorrect: false },
          { label: 'D', text: 'There are k distinct encryption keys.', isCorrect: false }
        ]
      },
      {
        questionNumber: 5,
        questionText: 'What vulnerability in k-Anonymity prompted the formulation of "l-Diversity"?',
        options: [
          { label: 'A', text: 'Homogeneity attack: If all k individuals in an equivalence group share the exact same sensitive medical diagnosis, privacy is completely lost.', isCorrect: true },
          { label: 'B', text: 'k-Anonymity is too fast to compute.', isCorrect: false },
          { label: 'C', text: 'k-Anonymity only operates on images.', isCorrect: false },
          { label: 'D', text: 'Databases refuse to store anonymous data.', isCorrect: false }
        ]
      },
      {
        questionNumber: 6,
        questionText: 'What privacy guarantee is provided by "Differential Privacy" (ε-DP)?',
        options: [
          { label: 'A', text: 'The output of an analysis algorithm is mathematically bounded such that the presence or absence of any single individual has virtually no perceptible effect on the outcome.', isCorrect: true },
          { label: 'B', text: 'All data is deleted after 24 hours.', isCorrect: false },
          { label: 'C', text: 'No user can see their own password.', isCorrect: false },
          { label: 'D', text: 'All numbers are multiplied by epsilon.', isCorrect: false }
        ]
      },
      {
        questionNumber: 7,
        questionText: 'In Differential Privacy, how does the privacy budget parameter epsilon (ε) govern the privacy-utility trade-off?',
        options: [
          { label: 'A', text: 'A smaller ε provides stronger mathematical privacy protection by injecting more noise, at the cost of lower analytical accuracy/utility.', isCorrect: true },
          { label: 'B', text: 'A smaller ε eliminates all noise completely.', isCorrect: false },
          { label: 'C', text: 'ε controls how many users can register on the website.', isCorrect: false },
          { label: 'D', text: 'ε must always equal 100.', isCorrect: false }
        ]
      },
      {
        questionNumber: 8,
        questionText: 'What is the objective of Explainable AI (XAI) frameworks in high-stakes domain data mining (e.g., healthcare, loan approvals)?',
        options: [
          { label: 'A', text: 'To provide transparent, human-understandable justifications for predictions made by opaque black-box machine learning models.', isCorrect: true },
          { label: 'B', text: 'To print the source code of the operating system', isCorrect: false },
          { label: 'C', text: 'To prevent artificial intelligence models from using GPUs', isCorrect: false },
          { label: 'D', text: 'To force all models to be written in plain English sentences', isCorrect: false }
        ]
      },
      {
        questionNumber: 9,
        questionText: 'How does LIME (Local Interpretable Model-agnostic Explanations) generate explanations for a black-box model\'s prediction on an instance?',
        options: [
          { label: 'A', text: 'By perturbing the input instance, observing the black-box model\'s prediction shifts, and fitting an interpretable sparse linear surrogate model locally.', isCorrect: true },
          { label: 'B', text: 'By decompiling the CPU machine code', isCorrect: false },
          { label: 'C', text: 'By converting the black box into a relational database table', isCorrect: false },
          { label: 'D', text: 'By asking human annotators to vote online', isCorrect: false }
        ]
      },
      {
        questionNumber: 10,
        questionText: 'On what mathematical discipline are SHAP (SHapley Additive exPlanations) values founded?',
        options: [
          { label: 'A', text: 'Cooperative Game Theory (Shapley values for fair payoff attribution among cooperating players)', isCorrect: true },
          { label: 'B', text: 'Euclidean Geometry', isCorrect: false },
          { label: 'C', text: 'Quantum Electrodynamics', isCorrect: false },
          { label: 'D', text: 'Relational Database Calculus', isCorrect: false }
        ]
      },
      {
        questionNumber: 11,
        questionText: 'What is "Community Detection" in social and complex network mining?',
        options: [
          { label: 'A', text: 'Partitioning a graph into clusters of nodes with dense internal edge connections and relatively sparse inter-community connections.', isCorrect: true },
          { label: 'B', text: 'Organizing a meetup for software engineers', isCorrect: false },
          { label: 'C', text: 'Counting the number of physical network cables in a building', isCorrect: false },
          { label: 'D', text: 'Deleting all disconnected nodes from a graph', isCorrect: false }
        ]
      },
      {
        questionNumber: 12,
        questionText: 'Which graph metric measures the density of edges inside communities compared to edges between communities against a null model?',
        options: [
          { label: 'A', text: 'Modularity (Q)', isCorrect: true },
          { label: 'B', text: 'Shannon Entropy', isCorrect: false },
          { label: 'C', text: 'Gini Impurity', isCorrect: false },
          { label: 'D', text: 'Lift', isCorrect: false }
        ]
      },
      {
        questionNumber: 13,
        questionText: 'In Spatio-Temporal data mining, what is "Spatial Autocorrelation" (often summarized by Tobler\'s First Law of Geography)?',
        options: [
          { label: 'A', text: 'Everything is related to everything else, but near things are more related than distant things.', isCorrect: true },
          { label: 'B', text: 'Geographic locations have zero correlation with weather.', isCorrect: false },
          { label: 'C', text: 'Spatial data cannot be analyzed using statistics.', isCorrect: false },
          { label: 'D', text: 'All maps must be projected onto a flat plane.', isCorrect: false }
        ]
      },
      {
        questionNumber: 14,
        questionText: 'Which algorithm dynamically maintains an adaptive sliding window of variable size over streaming data by shrinking the window when concept drift is detected?',
        options: [
          { label: 'A', text: 'ADWIN (ADaptive WINdowing)', isCorrect: true },
          { label: 'B', text: 'Apriori', isCorrect: false },
          { label: 'C', text: 'DBSCAN', isCorrect: false },
          { label: 'D', text: 'FP-Growth', isCorrect: false }
        ]
      },
      {
        questionNumber: 15,
        questionText: 'What is "Reservoir Sampling" in streaming data analysis?',
        options: [
          { label: 'A', text: 'A family of randomized algorithms for choosing an unbiased random sample of k items from a data stream of unknown, unbounded length in a single pass.', isCorrect: true },
          { label: 'B', text: 'Storing water for hydroelectric power plants', isCorrect: false },
          { label: 'C', text: 'A backup power supply for server racks', isCorrect: false },
          { label: 'D', text: 'Discarding 99% of stream data deterministically', isCorrect: false }
        ]
      },
      {
        questionNumber: 16,
        questionText: 'What distinguishes "t-Closeness" from "l-Diversity"?',
        options: [
          { label: 'A', text: 't-Closeness mandates that the distance between the distribution of a sensitive attribute within an equivalence class and the global distribution does not exceed threshold t.', isCorrect: true },
          { label: 'B', text: 't-Closeness requires that all numbers are multiples of t.', isCorrect: false },
          { label: 'C', text: 'l-Diversity uses encryption; t-Closeness does not.', isCorrect: false },
          { label: 'D', text: 'They are identical algorithms under different names.', isCorrect: false }
        ]
      },
      {
        questionNumber: 17,
        questionText: 'How is noise typically added to numerical query outputs to satisfy Differential Privacy?',
        options: [
          { label: 'A', text: 'By sampling noise from a Laplace or Gaussian distribution calibrated to the query\'s global sensitivity and epsilon parameter.', isCorrect: true },
          { label: 'B', text: 'By generating random English letters', isCorrect: false },
          { label: 'C', text: 'By playing acoustic noise over the microphone', isCorrect: false },
          { label: 'D', text: 'By flipping every bit in the database', isCorrect: false }
        ]
      },
      {
        questionNumber: 18,
        questionText: 'What is "Algorithmic Fairness" and bias mitigation in modern machine learning systems?',
        options: [
          { label: 'A', text: 'Designing models that prevent systemic discrimination against historically protected groups (e.g., race, gender) across predictive decisions.', isCorrect: true },
          { label: 'B', text: 'Making sure all computer processors run at the same speed', isCorrect: false },
          { label: 'C', text: 'Charging all customers identical prices', isCorrect: false },
          { label: 'D', text: 'Giving every algorithm 5 stars in online reviews', isCorrect: false }
        ]
      },
      {
        questionNumber: 19,
        questionText: 'What is Graph Convolutional Network (GCN) designed to do?',
        options: [
          { label: 'A', text: 'Perform deep feature learning on non-Euclidean graph topologies by aggregating information from neighboring nodes and edges.', isCorrect: true },
          { label: 'B', text: 'Draw bar charts in Microsoft Excel', isCorrect: false },
          { label: 'C', text: 'Convert SQL queries into PDF files', isCorrect: false },
          { label: 'D', text: 'Delete isolated subgraphs automatically', isCorrect: false }
        ]
      },
      {
        questionNumber: 20,
        questionText: 'Why is Post-Hoc Interpretability (via tools like SHAP and LIME) vital for regulatory compliance under the EU AI Act and GDPR?',
        options: [
          { label: 'A', text: 'Because regulations mandate that individuals subject to automated decisions have a right to understand the decisive factors influencing those outcomes.', isCorrect: true },
          { label: 'B', text: 'Because without XAI, computers cannot connect to the internet.', isCorrect: false },
          { label: 'C', text: 'Because XAI eliminates the need for software testing.', isCorrect: false },
          { label: 'D', text: 'Because EU law prohibits all computer algorithms.', isCorrect: false }
        ]
      }
    ]
  }
];

module.exports = {
  chaptersDataPart2
};

