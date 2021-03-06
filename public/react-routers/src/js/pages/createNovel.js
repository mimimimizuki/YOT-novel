import React from 'react';
import firebase, { db } from '../connectDB';
import RubyText from '../components/RubyText';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      category: '',
      overview: '',
      value: '',
      isTempView: false,
      rubyText: null,
    };

    this.val_handleChange = this.val_handleChange.bind(this);
    this.title_handleChange = this.title_handleChange.bind(this);
    this.category_handleChange = this.category_handleChange.bind(this);
    this.overview_handleChange = this.overview_handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.areaChange = this.areaChange.bind(this);
    this.insertRuby = this.insertRuby.bind(this);
  }

  val_handleChange(event) {
    this.setState({ value: event.target.value });
  }
  title_handleChange(event) {
    this.setState({ title: event.target.value });
  }
  category_handleChange(event) {
    this.setState({ category: event.target.value });
  }
  overview_handleChange(event) {
    this.setState({ overview: event.target.value });
  }

  // 小説投稿処理、マイページへの遷移
  async handleSubmit(event) {
    const val = this.state.value;
    const title = this.state.title;
    const category = this.state.category;
    const overview = this.state.overview;

    // 小説の本文が空なら投稿しない
    if (val === '') {
      return;
    }

    var newDocId;
    var uid = firebase.auth().currentUser.uid;
    // 小説投稿処理
    db.collection('users')
      .doc(uid)
      .get()
      .then((doc) => {
        db.collection('novels')
          .add({
            author_id: uid,
            name: doc.data().username,
            title: title,
            category: category,
            overview: overview,
            text: val,
            created: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then((docRef) => {
            newDocId = docRef.id;
          });
      });

    await event.preventDefault();

    // 書いた小説のページへ戻る
    // fibase自体のエラーにより強制的にtimeout
    setTimeout(() => {
      const site = '/novel?id=' + newDocId;
      this.props.history.push(site);
    }, 400);
  }

  // プレビューと編集を切り替える
  areaChange() {
    this.setState({ isTempView: !this.state.isTempView });
    this.setState({
      rubyText: <RubyText plainText={this.state.value}></RubyText>,
    });
  }

  // 編集画面の時にルビ用の記号を入れる
  insertRuby() {
    if (!this.state.isTempView) {
      var inputarea = document.getElementById('text');
      var str = inputarea.textContent;
      this.setState({ value: str + '|ルビを振りたい文字|ルビ|' });
    }
  }

  render() {
    return (
      <div style={{ margin: '1em' }}>
        <h2>小説を投稿する</h2>
        <div className="row write-novel">
          <form onSubmit={this.handleSubmit} style={{ marginTop: '4em' }}>
            <div class="novel-input-name">
              <div class="input-name">タイトル</div>
              <input
                type="text"
                id="title"
                size="30"
                maxLength="20"
                value={this.state.title}
                onChange={this.title_handleChange}
                placeholder="タイトル"
              ></input>
            </div>
            <div class="novel-input-name">
              <div class="input-name">カテゴリ</div>
              <div class="cp_ipselect cp_sl01 cat-selecter">
                <select
                  value={this.state.category}
                  onChange={this.category_handleChange}
                  required
                >
                  <option value="" hidden>
                    カテゴリを選ぶ
                  </option>
                  <option value="SF">SF</option>
                  <option value="ホラー">ホラー</option>
                  <option value="サスペンス">サスペンス</option>
                  <option value="童話">童話</option>
                  <option value="ファンタジー">ファンタジー</option>
                  <option value="comedy">comedy</option>
                  <option value="学園物語">学園物語</option>
                  <option value="ミステリー">ミステリー</option>
                  <option value="エッセイ">エッセイ</option>
                </select>
              </div>
            </div>
            <div class="novel-input-name">
              <div class="input-name">概要</div>
              <div class="input-detail">*概要は一覧などに表示されます</div>
              <textarea
                type="text"
                id="overview"
                value={this.state.overview}
                onChange={this.overview_handleChange}
                placeholder="概要"
              />
            </div>
            <div class="novel-input-name">
              <div class="input-name">本文</div>
              <button
                type="button"
                class="edit-area-change"
                onClick={this.areaChange}
              >
                {this.state.isTempView ? '編集に戻る' : 'プレビュー'}
              </button>
              <button
                type="button"
                class="insert-ruby"
                onClick={this.insertRuby}
              >
                ルビ記号を入れる
              </button>
              <div class="edit-area">
                <textarea
                  type="text"
                  id="text"
                  class={
                    this.state.isTempView
                      ? 'edit-area noview'
                      : 'edit-area view'
                  }
                  value={this.state.value}
                  onChange={this.val_handleChange}
                  placeholder="本文"
                />
                <div
                  class={
                    this.state.isTempView
                      ? 'temp-view-area view'
                      : 'temp-view-area noview'
                  }
                >
                  {this.state.rubyText}
                </div>
              </div>
            </div>
            <div class="submit-button-wrapper">
              <button
                type="submit"
                className="waves-effect waves-light btn col"
              >
                投稿する
              </button>
            </div>
          </form>
        </div>
        <div class="buck-button-wrapper">
          <button
            class="buck-button"
            onClick={() => this.props.history.push('/mypage')}
          >
            &lt;&lt;マイページへ
          </button>
        </div>
      </div>
    );
  }
}
