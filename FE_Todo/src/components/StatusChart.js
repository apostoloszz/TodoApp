import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Sector,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Tabs, Badge, Card, Row, Col, Statistic } from "antd";
import {
  CheckOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  PieChartOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import "../styles/StatusChart.css";

const StatusChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeChartType, setActiveChartType] = useState("pie");
  const [animatedData, setAnimatedData] = useState([]);
  const [processedData, setProcessedData] = useState([]);

  const COLORS = {
    // English names with both formats
    Completed: "#4CBB17", // Green
    Done: "#4CBB17", // Green
    "In Progress": "#4169E1", // Blue
    "Not Started": "#FF6347", // Red
    Todo: "#FF6347", // Red
    Pending: "#FFA500", // Orange

    // Uppercase enum values
    COMPLETED: "#4CBB17", // Green
    IN_PROGRESS: "#4169E1", // Blue
    NOT_STARTED: "#FF6347", // Red
    TODO: "#FF6347", // Red
    PENDING: "#FFA500", // Orange

    // With underscores
    In_Progress: "#4169E1", // Blue
    Not_Started: "#FF6347", // Red

    // Vietnamese names (if needed)
    "Hoàn thành": "#4CBB17", // Green
    "Đang thực hiện": "#4169E1", // Blue
    "Chưa bắt đầu": "#FF6347", // Red
    "Đợi xử lý": "#FFA500", // Orange

    default: "#9370DB", // Purple
  };

  const DEFAULT_COLORS = [
    "#4CBB17",
    "#4169E1",
    "#FF6347",
    "#FFA500",
    "#9370DB",
    "#20B2AA",
  ];

  const RADIAN = Math.PI / 180;

  // Handle empty data
  const chartData =
    data && data.length > 0 ? data : [{ name: "No Data", value: 1 }];

  // Animation effect for data loading and data normalization
  useEffect(() => {
    // Avoid processing if data hasn't changed meaningfully
    if (!data || data.length === 0) {
      // Just set default no-data state
      setProcessedData([]);
      setAnimatedData([{ name: "No Data", value: 1 }]);
      return;
    }

    // Reset animated data when new data comes in
    setAnimatedData([]);

    // Use a try/catch to prevent any processing errors
    try {
      console.log("StatusChart processing data:", data.length, "items");

      // Normalize status names for consistent coloring
      const normalizedData = chartData
        .filter((item) => item && item.value > 0) // Remove items with zero count
        .map((item) => {
          // Create a normalized name for color mapping
          const normalizedName = (item.name || "")
            .toUpperCase()
            .replace(/ /g, "_");

          // Get the color based on name matching (try multiple formats)
          let color = COLORS[item.name];
          if (!color) color = COLORS[normalizedName];
          if (!color) color = COLORS[item.name?.replace(/_/g, " ")];
          if (!color) color = COLORS.default;

          return {
            ...item,
            normalizedName,
            color,
          };
        })
        // Sort by value for better presentation
        .sort((a, b) => b.value - a.value);

      console.log("Normalized chart data:", normalizedData.length, "items");
      setProcessedData(normalizedData);

      // Stagger the animation for a smoother effect
      const timer = setTimeout(() => {
        setAnimatedData(normalizedData);
      }, 300);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Error processing chart data:", error);
      // Set safe default state
      setProcessedData([]);
      setAnimatedData([{ name: "Error", value: 1 }]);
    }
    // Use data directly instead of chartData to prevent circular dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const getStatusIcon = (status) => {
    const name = typeof status === "string" ? status.toLowerCase() : "";
    if (name.includes("complete") || name.includes("done")) {
      return <CheckOutlined />;
    } else if (name.includes("progress")) {
      return <SyncOutlined spin />;
    } else {
      return <ClockCircleOutlined />;
    }
  };

  const getColorForStatus = (status) => {
    // Try multiple formats to match the color
    return (
      COLORS[status] ||
      COLORS[status.toUpperCase()] ||
      COLORS[status.toUpperCase().replace(/ /g, "_")] ||
      COLORS[status.replace(/_/g, " ")] ||
      COLORS.default
    );
  };

  const renderActiveShape = (props) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;

    return (
      <g>
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <text
          x={cx}
          y={cy + 10}
          dy={8}
          textAnchor="middle"
          fill={fill}
          fontSize={14}
          fontWeight="bold"
        >
          {`${value} task${value !== 1 ? "s" : ""} (${(percent * 100).toFixed(
            0
          )}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  // Calculate total tasks from processed data or fall back to chart data
  const totalTasks =
    processedData.length > 0
      ? processedData.reduce((sum, item) => sum + item.value, 0)
      : chartData.reduce((sum, item) => sum + item.value, 0);

  // Get counts for specific statuses with better matching
  const getStatusCount = (statusName) => {
    // Try to find status by exact name first
    let status = processedData.find(
      (item) => item.name.toLowerCase() === statusName.toLowerCase()
    );

    if (!status) {
      // Try to match by normalized name
      const normalizedSearchName = statusName.toUpperCase().replace(/ /g, "_");
      status = processedData.find(
        (item) => item.normalizedName === normalizedSearchName
      );
    }

    if (!status) {
      // Try partial match as last resort
      status = processedData.find((item) =>
        item.name.toLowerCase().includes(statusName.toLowerCase())
      );
    }

    return status ? status.value : 0;
  };

  const completedCount = getStatusCount("Completed") || getStatusCount("Done");
  const inProgressCount = getStatusCount("In Progress");
  const pendingCount =
    getStatusCount("Pending") ||
    getStatusCount("Not Started") ||
    getStatusCount("Todo");

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className="status-chart-container">
      <Card className="status-chart">
        <h3 className="chart-title">Task Status Overview</h3>

        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={8}>
            <Card
              className={`stat-card completed ${
                completedCount > 0 ? "has-data" : ""
              }`}
              hoverable
            >
              <Statistic
                title={<span className="stat-title">Completed</span>}
                value={completedCount}
                suffix={totalTasks > 0 ? `/ ${totalTasks}` : ""}
                prefix={<CheckOutlined className="stat-icon" />}
                valueStyle={{
                  color: "#4CBB17",
                  fontWeight: "bold",
                  animation: animatedData.length > 0 ? "fadeIn 0.5s" : "none",
                }}
              />
              {totalTasks > 0 && (
                <div className="stat-percentage">
                  {completedCount > 0
                    ? `${Math.round((completedCount / totalTasks) * 100)}%`
                    : "0%"}
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              className={`stat-card in-progress ${
                inProgressCount > 0 ? "has-data" : ""
              }`}
              hoverable
            >
              <Statistic
                title={<span className="stat-title">In Progress</span>}
                value={inProgressCount}
                suffix={totalTasks > 0 ? `/ ${totalTasks}` : ""}
                prefix={<SyncOutlined spin className="stat-icon" />}
                valueStyle={{
                  color: "#4169E1",
                  fontWeight: "bold",
                  animation: animatedData.length > 0 ? "fadeIn 0.7s" : "none",
                }}
              />
              {totalTasks > 0 && (
                <div className="stat-percentage">
                  {inProgressCount > 0
                    ? `${Math.round((inProgressCount / totalTasks) * 100)}%`
                    : "0%"}
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              className={`stat-card pending ${
                pendingCount > 0 ? "has-data" : ""
              }`}
              hoverable
            >
              <Statistic
                title={<span className="stat-title">Pending</span>}
                value={pendingCount}
                suffix={totalTasks > 0 ? `/ ${totalTasks}` : ""}
                prefix={<ClockCircleOutlined className="stat-icon" />}
                valueStyle={{
                  color: "#FFA500",
                  fontWeight: "bold",
                  animation: animatedData.length > 0 ? "fadeIn 0.9s" : "none",
                }}
              />
              {totalTasks > 0 && (
                <div className="stat-percentage">
                  {pendingCount > 0
                    ? `${Math.round((pendingCount / totalTasks) * 100)}%`
                    : "0%"}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        <div className="chart-tabs-container">
          <Tabs
            defaultActiveKey="pie"
            onChange={setActiveChartType}
            className="chart-tabs"
            tabBarExtraContent={
              <div className="chart-legend">
                {(processedData.length > 0 ? processedData : chartData)
                  .filter((entry) => entry.value > 0) // Only show non-zero entries
                  .map((entry, index) => (
                    <Badge
                      key={`legend-${index}`}
                      color={
                        entry.color || // Use pre-calculated color
                        getColorForStatus(entry.name) ||
                        DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                      }
                      text={`${entry.name} (${entry.value})`}
                    />
                  ))}
              </div>
            }
            items={[
              {
                key: "pie",
                label: (
                  <span>
                    <PieChartOutlined /> Pie Chart
                  </span>
                ),
                children: (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={animatedData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                        isAnimationActive={true}
                      >
                        {animatedData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.color || // Use pre-calculated color if available
                              getColorForStatus(entry.name) ||
                              DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => {
                          const percentage =
                            totalTasks > 0
                              ? ` (${Math.round((value / totalTasks) * 100)}%)`
                              : "";
                          return [
                            `${value} task${
                              value !== 1 ? "s" : ""
                            }${percentage}`,
                            name,
                          ];
                        }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          animation: "fadeIn 0.3s ease-out",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ),
              },
              {
                key: "bar",
                label: (
                  <span>
                    <BarChartOutlined /> Bar Chart
                  </span>
                ),
                children: (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={animatedData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => {
                          const percentage =
                            totalTasks > 0
                              ? ` (${Math.round((value / totalTasks) * 100)}%)`
                              : "";
                          return [
                            `${value} task${
                              value !== 1 ? "s" : ""
                            }${percentage}`,
                            "Count",
                          ];
                        }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          animation: "fadeIn 0.3s ease-out",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                        radius={[5, 5, 0, 0]}
                        isAnimationActive={true}
                      >
                        {animatedData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.color || // Use pre-calculated color if available
                              getColorForStatus(entry.name) ||
                              DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ),
              },
            ]}
          />
        </div>
      </Card>
    </div>
  );
};

export default StatusChart;
