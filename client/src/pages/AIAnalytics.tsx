import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Target, 
  BarChart3,
  Activity,
  Shield,
  Lightbulb,
  Zap
} from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  type: string;
  accuracy: string;
  description: string;
  features: string[];
}

interface CostPrediction {
  estimatedCost: string;
  confidencePercent: string;
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
}

interface BillingAnalytics {
  totalBills: number;
  averageCost: number;
  costTrends: Array<{
    category: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    changePercent: number;
  }>;
  predictedDemand: Array<{
    category: string;
    predictedUsage: number;
    confidence: number;
  }>;
}

const AIAnalytics: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('cost_predictor');
  const [testPrediction, setTestPrediction] = useState<CostPrediction | null>(null);
  const [analytics, setAnalytics] = useState<BillingAnalytics | null>(null);

  // Fetch AI models information
  const { data: modelsData, isLoading: modelsLoading } = useQuery({
    queryKey: ['/api/ai/models'],
    queryFn: () => fetch('/api/ai/models').then(res => res.json())
  });

  // Test cost prediction with sample data
  const testCostPrediction = async () => {
    try {
      const sampleItems = [
        { id: 1, name: 'General Consultation', category: 'Dr. Fees', price: 500 },
        { id: 2, name: 'Blood Test', category: 'Laboratory', price: 300 },
        { id: 3, name: 'X-Ray Chest', category: 'X-Ray', price: 400 }
      ];

      const response = await fetch('/api/ai/predict-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: sampleItems,
          patientType: 'outpatient'
        })
      });

      const data = await response.json();
      if (data.success) {
        setTestPrediction(data.prediction);
      }
    } catch (error) {
      console.error('Cost prediction test failed:', error);
    }
  };

  // Generate billing analytics
  const generateAnalytics = async () => {
    try {
      const sampleBillHistory = [
        { total: 1200, items: ['Dr. Fees', 'Laboratory'], timestamp: new Date() },
        { total: 850, items: ['Medicine', 'X-Ray'], timestamp: new Date() },
        { total: 2100, items: ['Surgery', 'Laboratory'], timestamp: new Date() }
      ];

      const response = await fetch('/api/ai/billing-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billHistory: sampleBillHistory })
      });

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Analytics generation failed:', error);
    }
  };

  useEffect(() => {
    generateAnalytics();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      default: return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string): "destructive" | "secondary" => {
    switch (trend) {
      case 'increasing': return 'destructive';
      default: return 'secondary';
    }
  };

  if (modelsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-pulse mx-auto mb-4 text-emerald-600" />
          <p className="text-lg">Loading AI Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            AI-Powered Medical Analytics
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Leverage machine learning and predictive analytics to optimize medical billing, 
          forecast costs, and improve healthcare decision-making processes.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{modelsData?.totalModels || 4}</div>
            <div className="text-sm text-muted-foreground">AI Models</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{modelsData?.averageAccuracy || '88.5%'}</div>
            <div className="text-sm text-muted-foreground">Avg Accuracy</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">৳{analytics?.averageCost.toFixed(0) || '1,350'}</div>
            <div className="text-sm text-muted-foreground">Avg Bill Cost</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{analytics?.totalBills || 0}</div>
            <div className="text-sm text-muted-foreground">Bills Analyzed</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Models
          </TabsTrigger>
          <TabsTrigger value="prediction" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Cost Prediction
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* AI Models Tab */}
        <TabsContent value="models">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {modelsData?.models?.map((model: AIModel) => (
              <Card key={model.id} className={`glass-card transition-all duration-300 hover:shadow-lg ${
                selectedModel === model.id ? 'ring-2 ring-emerald-500' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {model.type === 'cost_prediction' && <DollarSign className="h-5 w-5 text-emerald-600" />}
                        {model.type === 'demand_forecasting' && <TrendingUp className="h-5 w-5 text-blue-600" />}
                        {model.type === 'billing_optimization' && <Activity className="h-5 w-5 text-purple-600" />}
                        {model.type === 'fraud_detection' && <Shield className="h-5 w-5 text-red-600" />}
                        {model.name}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-2">
                        {model.accuracy} Accuracy
                      </Badge>
                    </div>
                    <Button
                      variant={selectedModel === model.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedModel(model.id)}
                    >
                      {selectedModel === model.id ? 'Selected' : 'Select'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{model.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Features:</h4>
                    <ul className="text-xs space-y-1">
                      {model.features?.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Cost Prediction Tab */}
        <TabsContent value="prediction">
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600" />
                  AI Cost Prediction Demo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Test the AI cost prediction model with sample medical items
                  </p>
                  <Button onClick={testCostPrediction} className="bg-emerald-600 hover:bg-emerald-700">
                    Run Prediction
                  </Button>
                </div>

                {testPrediction && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">
                          {testPrediction.estimatedCost}
                        </div>
                        <div className="text-sm text-muted-foreground">Predicted Cost</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {testPrediction.confidencePercent}
                        </div>
                        <div className="text-sm text-muted-foreground">Confidence Level</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Cost Factors:</h4>
                      <div className="space-y-2">
                        {testPrediction.factors?.map((factor, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <div>
                              <div className="font-medium text-sm">{factor.factor}</div>
                              <div className="text-xs text-muted-foreground">{factor.description}</div>
                            </div>
                            <Badge variant={factor.impact > 0.1 ? 'destructive' : 'secondary'}>
                              +{(factor.impact * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">AI Recommendations:</h4>
                      <ul className="space-y-1">
                        {testPrediction.recommendations?.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Trends */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Cost Trends Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.costTrends && analytics.costTrends.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.costTrends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center gap-2">
                          {getTrendIcon(trend.trend)}
                          <span className="font-medium">{trend.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getTrendColor(trend.trend) as any}>
                            {trend.changePercent > 0 ? '+' : ''}{trend.changePercent}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No trend data available. Generate analytics to see cost trends.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Demand Forecasting */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Demand Forecasting
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.predictedDemand && analytics.predictedDemand.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.predictedDemand.map((demand, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{demand.category}</span>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{demand.predictedUsage}</div>
                            <div className="text-xs text-muted-foreground">
                              {Math.round(demand.confidence * 100)}% confidence
                            </div>
                          </div>
                        </div>
                        <Progress value={demand.confidence * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No demand forecast available. Generate analytics to see predictions.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          <div className="space-y-6">
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                AI insights help optimize medical billing processes and improve cost management 
                through predictive analytics and machine learning algorithms.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Cost Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      AI identifies cost-saving opportunities across medical categories
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      Predictive models suggest optimal resource allocation
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                      Machine learning detects pricing anomalies and billing errors
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Risk Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                      AI assesses patient risk profiles for better care planning
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                      Fraud detection algorithms identify suspicious billing patterns
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                      Predictive analytics prevent costly medical complications
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    Process Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      Automated billing workflows reduce manual errors
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      ML algorithms optimize appointment scheduling and resource usage
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                      Predictive models improve inventory management
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Future Planning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      Demand forecasting helps plan medical service capacity
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      AI-driven insights support strategic healthcare decisions
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      Predictive analytics improve patient outcome planning
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAnalytics;