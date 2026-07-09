<template>
  <div class="culture-page">
    <h1>布依族文化</h1>
    <p class="subtitle">探索布依族丰富的文化遗产</p>
    
    <div class="culture-grid">
      <div class="culture-card">
        <div class="card-icon">🗺️</div>
        <h3>语言分布</h3>
        <p>布依语属汉藏语系壮侗语族壮傣语支，主要分布在贵州省</p>
      </div>
      
      <div class="culture-card">
        <div class="card-icon">🎵</div>
        <h3>声调系统</h3>
        <p>布依语有6个声调，是声调语言的重要代表</p>
      </div>
      
      <div class="culture-card">
        <div class="card-icon">📝</div>
        <h3>文字系统</h3>
        <p>布依族历史上使用过多种文字，现以拉丁字母为主</p>
      </div>
    </div>
    
    <div class="heritage-section">
      <h2>非物质文化遗产</h2>
      <div class="heritage-list">
        <div class="heritage-item">
          <h4>蜡染工艺</h4>
          <p>世界非物质文化遗产，以靛蓝染料在棉麻布上绘制蓝白相间的图案</p>
        </div>
        <div class="heritage-item">
          <h4>织锦技艺</h4>
          <p>布依族传统织锦，菱形、锯齿几何纹样中的点缀色</p>
        </div>
        <div class="heritage-item">
          <h4>银饰制作</h4>
          <p>布依族盛装银饰，银为驱邪纳福之物，重大节庆佩戴</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.culture-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  text-align: center;
  color: #1B3A5C;
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
}

.culture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 50px;
}

.culture-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  text-align: center;
  transition: transform 0.3s;
}

.culture-card:hover {
  transform: translateY(-5px);
}

.card-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.culture-card h3 {
  color: #1B3A5C;
  margin-bottom: 10px;
}

.culture-card p {
  color: #666;
  line-height: 1.6;
}

.heritage-section {
  background: #f8f9fa;
  padding: 40px;
  border-radius: 12px;
}

.heritage-section h2 {
  text-align: center;
  color: #1B3A5C;
  margin-bottom: 30px;
}

.heritage-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.heritage-item {
  background: white;
  padding: 25px;
  border-radius: 8px;
  border-left: 4px solid #3A6B8C;
}

.heritage-item h4 {
  color: #1B3A5C;
  margin: 0 0 10px 0;
}

.heritage-item p {
  color: #666;
  margin: 0;
  line-height: 1.6;
}
</style>
